// dealer-outreach-tick
//
// The dealer outreach autopilot. pg_cron calls this every 20 minutes; each call sends AT MOST
// one email, so sends land at uneven, human-looking times inside business hours.
//
// Rules (all read from public.outreach_settings, one row):
//   - nothing is sent while `enabled` is false (the owner's on/off switch)
//   - only on `send_days` (ISO weekday) between window_start_hour and window_end_hour,
//     Dar es Salaam time (UTC+3, no DST)
//   - at most `daily_cap` emails a day; the chance of sending on a tick is spread so the
//     cap is reached roughly by the end of the window, never in a burst
//   - at least 25 minutes between any two sends
//   - each dealer gets at most two emails: the invitation, then one follow-up after
//     `followup_days` if they have not replied, unsubscribed, bounced or complained
//
// Modes (POST JSON):
//   {}                                   -> a normal tick
//   {"mode":"status"}                    -> settings, counts and Resend domain status; sends nothing
//   {"mode":"preview","to":"a@b.com","step":1|2,"variant":"v1"|"v4"}
//                                        -> sends one sample to `to` with a sample dealer, logs nothing
//
// Auth: service role key as Bearer, or x-outreach-secret = OUTREACH_TICK_SECRET. Anyone else gets 401,
// so this can never be used to send mail as Motokah.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TEMPLATES } from "./templates.ts";

const FROM_ADDRESS = "Motokah Dealers <dealers@motokah.com>";
const REPLY_TO = "dealers@motokah.com";
const CAMPAIGN = "dealer-autopilot";
const MIN_GAP_MINUTES = 25;
const TICK_MINUTES = 20;
const TZ_OFFSET_HOURS = 3; // Africa/Dar_es_Salaam, Nairobi, Kampala, Addis Ababa

const FIRST: Record<string, { file: string; subject: string }> = {
  v1: { file: "dealer-new.html", subject: "Let buyers find your next car" },
  v4: { file: "dealer-growth-visual.html", subject: "Buyers are already searching on Motokah" },
};
const FOLLOWUP = { file: "dealer-followup.html", subject: "Re: your showroom on Motokah" };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function template(file: string) {
  const t = TEMPLATES[file];
  if (!t) throw new Error(`missing template ${file}`);
  return t;
}

function localNow() {
  const d = new Date(Date.now() + TZ_OFFSET_HOURS * 3600_000); // read with getUTC* = local wall clock
  const isoDow = ((d.getUTCDay() + 6) % 7) + 1;
  const midnightUtc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - TZ_OFFSET_HOURS * 3600_000);
  return { hour: d.getUTCHours(), minute: d.getUTCMinutes(), isoDow, midnightUtc, monthLabel: d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" }) };
}

serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const tickSecret = Deno.env.get("OUTREACH_TICK_SECRET");
  const auth = req.headers.get("authorization") || "";
  const okAuth = auth === `Bearer ${serviceKey}` || (!!tickSecret && req.headers.get("x-outreach-secret") === tickSecret);
  if (!okAuth) return json({ error: "unauthorized" }, 401);

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const unsubSecret = Deno.env.get("DEALER_UNSUBSCRIBE_SECRET") || Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (!resendKey || !unsubSecret) return json({ error: "RESEND_API_KEY or unsubscribe secret missing" }, 500);

  const db = createClient(supabaseUrl, serviceKey);
  const body = await req.json().catch(() => ({}));
  const mode = body?.mode || "tick";
  const { data: s } = await db.from("outreach_settings").select("*").eq("id", 1).single();
  if (!s) return json({ error: "outreach_settings row missing" }, 500);
  const now = localNow();

  async function render(file: string, c: { email: string; dealer_name: string | null; country: string | null }) {
    const token = await hmacHex(unsubSecret!, c.email.toLowerCase());
    const unsubscribeLink = `${supabaseUrl}/functions/v1/dealer-unsubscribe?email=${encodeURIComponent(c.email)}&token=${token}`;
    const country = (c.country || "East Africa").trim();
    const name = (c.dealer_name || "").trim() || "there";
    const html = template(file)
      .replaceAll("{{DEALER_NAME}}", name)
      .replaceAll("{{DEALER_COUNTRY}}", country)
      .replaceAll("{{DEALER_COUNTRY_UPPER}}", country.toUpperCase())
      .replaceAll("{{UNSUBSCRIBE_LINK}}", unsubscribeLink)
      .replaceAll("{{STAT_IMPRESSIONS}}", (s.stat_impressions ?? 0).toLocaleString("en-US"))
      .replaceAll("{{STAT_CLICKS}}", (s.stat_clicks ?? 0).toLocaleString("en-US"))
      .replaceAll("{{STAT_MONTH_CLICKS}}", (s.stat_month_clicks ?? 0).toLocaleString("en-US"))
      .replaceAll("{{STAT_MONTH_LABEL}}", s.stat_month_label || now.monthLabel)
      .replaceAll("{{STAT_PERIOD}}", s.stat_period || "last 90 days");
    if (html.includes("{{")) throw new Error(`unfilled placeholder in ${file}`);
    return { html, unsubscribeLink };
  }

  async function send(to: string, subject: string, html: string, unsubscribeLink: string) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_ADDRESS, to, reply_to: REPLY_TO, subject, html,
        headers: { "List-Unsubscribe": `<${unsubscribeLink}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      }),
    });
    const text = await res.text();
    return { ok: res.ok, id: res.ok ? JSON.parse(text)?.id ?? null : null, error: res.ok ? null : text };
  }

  if (mode === "status") {
    const domains = await (await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${resendKey}` } })).json();
    const { data: counts } = await db.from("dealer_outreach_contacts").select("status, step");
    const tally: Record<string, number> = {};
    for (const r of counts ?? []) tally[`${r.status}/step${r.step}`] = (tally[`${r.status}/step${r.step}`] ?? 0) + 1;
    return json({ settings: s, now, contacts: tally, resendDomains: domains?.data?.map((d: any) => ({ name: d.name, status: d.status })) ?? domains });
  }

  if (mode === "preview") {
    const to = String(body.to || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return json({ error: "preview needs a valid `to`" }, 400);
    const sample = { email: to, dealer_name: body.dealer_name || "Car Junction Tanzania", country: body.country || "Tanzania" };
    const def = Number(body.step) === 2 ? FOLLOWUP : FIRST[body.variant] ?? FIRST.v1;
    const { html, unsubscribeLink } = await render(def.file, sample);
    const r = await send(to, `[PREVIEW] ${def.subject}`, html, unsubscribeLink);
    return json({ preview: def.file, to, ...r });
  }

  // ---- normal tick ----
  if (!s.enabled) return json({ skipped: "disabled" });
  if (!s.send_days.includes(now.isoDow)) return json({ skipped: "not a send day", now });
  if (now.hour < s.window_start_hour || now.hour >= s.window_end_hour) return json({ skipped: "outside hours", now });

  const { data: sentRows } = await db.from("dealer_email_log").select("created_at")
    .eq("campaign", CAMPAIGN).eq("status", "sent").gte("created_at", now.midnightUtc.toISOString())
    .order("created_at", { ascending: false });
  const sentToday = sentRows?.length ?? 0;
  if (sentToday >= s.daily_cap) return json({ skipped: "daily cap reached", sentToday });
  if (sentRows?.[0] && Date.now() - new Date(sentRows[0].created_at).getTime() < MIN_GAP_MINUTES * 60_000) {
    return json({ skipped: "too soon after last send" });
  }
  const minutesLeft = s.window_end_hour * 60 - (now.hour * 60 + now.minute);
  const ticksLeft = Math.max(1, Math.ceil(minutesLeft / TICK_MINUTES));
  const chance = Math.min(1, (s.daily_cap - sentToday) / ticksLeft) * (0.6 + Math.random() * 0.8);
  if (Math.random() > chance) return json({ skipped: "random wait", chance: Number(chance.toFixed(2)), sentToday });

  // Anyone who bounced or complained never gets another email.
  const { data: bad } = await db.from("dealer_email_log").select("email").eq("campaign", CAMPAIGN).in("error", ["email.bounced", "email.complained"]);
  for (const b of bad ?? []) {
    await db.from("dealer_email_suppressions").upsert({ email: b.email, reason: "bounce or complaint", source: "resend_event" });
    await db.from("dealer_outreach_contacts").update({ status: "bounced" }).eq("email", b.email).in("status", ["pending", "contacted"]);
  }

  // Follow-ups that are due go first, then new dealers in random order.
  const dueBefore = new Date(Date.now() - s.followup_days * 86400_000).toISOString();
  let { data: pick } = await db.from("dealer_outreach_contacts").select("*")
    .eq("status", "contacted").eq("step", 1).lt("last_sent_at", dueBefore).limit(1);
  if (!pick?.length) {
    const { data: pending } = await db.from("dealer_outreach_contacts").select("*").eq("status", "pending").eq("step", 0);
    pick = pending?.length ? [pending[Math.floor(Math.random() * pending.length)]] : [];
  }
  if (!pick?.length) return json({ skipped: "nobody left to contact" });
  const c = pick[0];

  const { data: suppressed } = await db.from("dealer_email_suppressions").select("email").eq("email", c.email).maybeSingle();
  if (suppressed) {
    await db.from("dealer_outreach_contacts").update({ status: "unsubscribed" }).eq("email", c.email);
    return json({ skipped: "suppressed", email: c.email });
  }

  const isFollowup = c.step === 1;
  const variant = isFollowup ? c.variant : Math.random() < 0.5 ? "v1" : "v4";
  const def = isFollowup ? FOLLOWUP : FIRST[variant];
  const { html, unsubscribeLink } = await render(def.file, c);
  const r = await send(c.email, def.subject, html, unsubscribeLink);

  await db.from("dealer_email_log").insert({
    campaign: CAMPAIGN, email: c.email, dealer_name: c.dealer_name, variant: isFollowup ? `${variant}-followup` : variant,
    step: c.step + 1, status: r.ok ? "sent" : "failed", resend_id: r.id, error: r.error,
  });
  await db.from("dealer_outreach_contacts").update(
    r.ok
      ? { step: c.step + 1, status: isFollowup ? "done" : "contacted", variant, last_sent_at: new Date().toISOString() }
      : { status: "failed" },
  ).eq("email", c.email);

  return json({ sent: r.ok, email: c.email, step: c.step + 1, variant, error: r.error, sentToday: sentToday + (r.ok ? 1 : 0) });
});
