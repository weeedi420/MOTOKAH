// send-dealer-invite
//
// Sends the branded dealer-invitation email to a batch of dealer contacts,
// A/B/C/D-testing across 4 comparable "new dealer" templates:
//   dealer-new            (variant key: "v1")
//   dealer-new-v2         (variant key: "v2")
//   dealer-new-v3         (variant key: "v3")
//   dealer-growth-visual  (variant key: "v4" -- visual/stats variant)
// (dealer-existing.html is a different audience -- existing dealers
// confirming/updating stock, not a new-dealer pitch -- and
// dealer-growth-demo.html still has placeholder Search Console figures
// that need real numbers before it's honest to send, so neither is part
// of this test. v4 uses REAL site-wide Google Search Console numbers
// (90-day pull: 329 clicks / 13,251 impressions / 2.5% CTR / avg position
// 17.1), framed explicitly as Motokah's overall traffic, not a per-dealer
// figure -- these are brand-new invitees with no Motokah page yet, so there
// is no real per-dealer view count to show. Do not add a per-dealer stat
// placeholder to any variant unless send-dealer-invite can fill it from a
// real query (see page_views/analytics_events tables) -- never fabricate one.
//
// Email-only: callers must already have filtered out phone-only contacts
// before calling this function.
//
// Safety features (per project rule: never send without consent path):
//   - checks dealer_email_suppressions before every send and skips suppressed emails
//   - appends a signed one-click unsubscribe link to every email
//   - logs every attempt (sent / failed / skipped_suppressed / skipped_no_email)
//     to dealer_email_log, including which variant was sent (for later A/B/C comparison)
//
// This function does NOT decide who to email. It only sends what it is told
// to send by its caller (scripts/send-dealer-invites.mjs), and that script
// defaults to a dry run. This function itself has no "dry run" mode -- if it
// is invoked, it sends. Treat invoking this function in production as a live
// send and get explicit human sign-off first.
//
// Variant assignment: pass `templateVariant` per recipient to pin a specific
// variant, or omit it and the function round-robins v1/v2/v3 across the
// batch in the order recipients were given (deterministic, so re-running
// the same ordered batch in a dry run and then live gives the same split).
//
// NOT deployed by this change. Review, then:
//   supabase db push
//   supabase functions deploy send-dealer-invite

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_ADDRESS = "Motokah <dealers@motokah.com>";
const CAMPAIGN = "dealer-invite-abc";
const UNSUBSCRIBE_BASE = "https://www.motokah.com/functions/v1"; // overridable below once deployed

// Variant registry -- the only place that needs to change to add/remove a
// variant from the test. Each file is bundled next to this function.
const VARIANTS: Record<string, { file: string; subject: string }> = {
  v1: { file: "dealer-new.html", subject: "Let buyers find your next car" },
  v2: { file: "dealer-new-v2.html", subject: "Your vehicles deserve to be found" },
  v3: { file: "dealer-new-v3.html", subject: "Grow your showroom with Motokah" },
  v4: { file: "dealer-growth-visual.html", subject: "Buyers are already searching on Motokah" },
};
const VARIANT_ROTATION = Object.keys(VARIANTS); // ["v1", "v2", "v3"]

interface DealerRecipient {
  name: string;
  email: string;
  country?: string;
  /** Pin a specific variant for this recipient; otherwise round-robin assigned. */
  templateVariant?: string;
}

interface InvitePayload {
  recipients: DealerRecipient[];
  /** Optional override, e.g. "Tanzania" for a single-country batch. Falls back to recipient.country, then "East Africa". */
  defaultCountry?: string;
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function buildUnsubscribeLink(email: string, secret: string, supabaseUrl: string): Promise<string> {
  const token = await hmacHex(secret, email.toLowerCase());
  const base = supabaseUrl ? `${supabaseUrl}/functions/v1` : UNSUBSCRIBE_BASE;
  return `${base}/dealer-unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

function renderTemplate(
  template: string,
  vars: { name: string; country: string; unsubscribeLink: string }
): string {
  return template
    .replaceAll("{{DEALER_NAME}}", vars.name || "there")
    .replaceAll("{{DEALER_COUNTRY}}", vars.country)
    .replaceAll("{{DEALER_COUNTRY_UPPER}}", vars.country.toUpperCase())
    .replaceAll("{{UNSUBSCRIBE_LINK}}", vars.unsubscribeLink);
}

// Cache loaded templates across the batch instead of re-reading per recipient.
const templateCache = new Map<string, string>();
async function loadTemplate(variantKey: string): Promise<string> {
  const def = VARIANTS[variantKey];
  if (!def) throw new Error(`Unknown templateVariant "${variantKey}". Valid: ${VARIANT_ROTATION.join(", ")}`);
  if (!templateCache.has(variantKey)) {
    const text = await Deno.readTextFile(new URL(`./${def.file}`, import.meta.url));
    templateCache.set(variantKey, text);
  }
  return templateCache.get(variantKey)!;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Service-role only: without this, anyone could use this function to send mail as Motokah.
  if (req.headers.get("authorization") !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload: InvitePayload = await req.json();
    const recipients = payload.recipients || [];

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return new Response(JSON.stringify({ error: "recipients (non-empty array) is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const unsubscribeSecret =
      Deno.env.get("DEALER_UNSUBSCRIBE_SECRET") || Deno.env.get("RESEND_WEBHOOK_SECRET");

    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured in Supabase secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!unsubscribeSecret) {
      return new Response(
        JSON.stringify({
          error:
            "No secret available to sign unsubscribe links. Set DEALER_UNSUBSCRIBE_SECRET in Supabase secrets.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: Array<{ email: string; status: string; variant?: string; error?: string }> = [];

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const email = (recipient.email || "").trim().toLowerCase();
      const name = (recipient.name || "").trim();
      const country = recipient.country?.trim() || payload.defaultCountry || "East Africa";
      const variantKey =
        recipient.templateVariant && VARIANTS[recipient.templateVariant]
          ? recipient.templateVariant
          : VARIANT_ROTATION[i % VARIANT_ROTATION.length];

      if (!email) {
        results.push({ email: "", status: "skipped_no_email" });
        await supabase.from("dealer_email_log").insert({
          campaign: CAMPAIGN,
          email: "",
          dealer_name: name,
          variant: variantKey,
          status: "skipped_no_email",
        });
        continue;
      }

      // Suppression check -- never send to an unsubscribed address.
      const { data: suppressed } = await supabase
        .from("dealer_email_suppressions")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (suppressed) {
        results.push({ email, status: "skipped_suppressed", variant: variantKey });
        await supabase.from("dealer_email_log").insert({
          campaign: CAMPAIGN,
          email,
          dealer_name: name,
          variant: variantKey,
          status: "skipped_suppressed",
        });
        continue;
      }

      const unsubscribeLink = await buildUnsubscribeLink(email, unsubscribeSecret, supabaseUrl);
      const template = await loadTemplate(variantKey);
      const html = renderTemplate(template, { name, country, unsubscribeLink });
      const subject = VARIANTS[variantKey].subject;

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_ADDRESS,
            to: email,
            subject,
            html,
            headers: {
              "List-Unsubscribe": `<${unsubscribeLink}>`,
            },
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          results.push({ email, status: "failed", variant: variantKey, error: err });
          await supabase.from("dealer_email_log").insert({
            campaign: CAMPAIGN,
            email,
            dealer_name: name,
            variant: variantKey,
            status: "failed",
            error: err,
          });
          continue;
        }

        const body = await res.json();
        results.push({ email, status: "sent", variant: variantKey });
        await supabase.from("dealer_email_log").insert({
          campaign: CAMPAIGN,
          email,
          dealer_name: name,
          variant: variantKey,
          status: "sent",
          resend_id: body?.id ?? null,
        });
      } catch (sendErr: any) {
        results.push({ email, status: "failed", variant: variantKey, error: String(sendErr?.message ?? sendErr) });
        await supabase.from("dealer_email_log").insert({
          campaign: CAMPAIGN,
          email,
          dealer_name: name,
          variant: variantKey,
          status: "failed",
          error: String(sendErr?.message ?? sendErr),
        });
      }
    }

    const summary = results.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});
    const variantSplit = results.reduce<Record<string, number>>((acc, r) => {
      if (r.variant) acc[r.variant] = (acc[r.variant] ?? 0) + 1;
      return acc;
    }, {});

    return new Response(JSON.stringify({ summary, variantSplit, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
