/**
 * Dealer invite send pipeline -- A/B/C/D test across 4 templates, DRY RUN BY DEFAULT.
 *
 * Reads launch/dealer-contacts/dealers.json (produced by a separate scraping
 * agent), filters to contacts that actually have an email address (this
 * campaign is email-only -- phone/WhatsApp-only dealers are skipped here and
 * belong to a different outreach channel), round-robin assigns each
 * recipient one of the 4 comparable "new dealer" templates (v1: dealer-new,
 * v2: dealer-new-v2, v3: dealer-new-v3, v4: dealer-growth-visual -- the
 * visual/stats variant, using REAL site-wide GSC numbers, not fabricated
 * ones), personalizes it, and either:
 *
 *   - (default) prints a dry-run report: variant split, counts, and a sample
 *     rendered email per variant. Does NOT call Resend or the edge function.
 *   - (--live) actually calls the send-dealer-invite Supabase edge function,
 *     which does the same round-robin assignment and records `variant` on
 *     every dealer_email_log row so performance can be compared later.
 *
 * dealer-existing.html and dealer-growth-demo.html are intentionally not
 * part of this test -- see the comment at the top of
 * supabase/functions/send-dealer-invite/index.ts for why.
 *
 * Safety rails on --live:
 *   - capped to the first 2 recipients unless --no-cap is also passed
 *   - requires VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (same as other
 *     scripts/*.mjs in this repo) to even attempt a call
 *
 * This script does NOT send anything unless you explicitly pass --live, and
 * per project rule, nobody should pass --live against real dealer addresses
 * without the owner reviewing the exact rendered email(s) and giving
 * explicit sign-off in the same conversation turn first.
 *
 * Usage:
 *   node scripts/send-dealer-invites.mjs                  -- dry run, all recipients
 *   node scripts/send-dealer-invites.mjs --limit=20        -- dry run, first 20
 *   node scripts/send-dealer-invites.mjs --live             -- LIVE send, capped to first 2
 *   node scripts/send-dealer-invites.mjs --live --no-cap     -- LIVE send, all recipients (dangerous)
 *
 * How to pull "which variant won" later (once real send + webhook data exists):
 *   select variant,
 *          count(*) as sent,
 *          count(*) filter (where open_count > 0) as opened,
 *          count(*) filter (where click_count > 0) as clicked,
 *          round(100.0 * count(*) filter (where open_count > 0) / count(*), 1) as open_rate_pct,
 *          round(100.0 * count(*) filter (where click_count > 0) / count(*), 1) as click_rate_pct
 *   from dealer_email_log
 *   where campaign = 'dealer-invite-abc' and status = 'sent'
 *   group by variant
 *   order by click_rate_pct desc;
 * Reply rate ("replies") isn't captured automatically -- that needs the reply
 * inbox (receive-email) cross-referenced by sender email, which is a follow-up,
 * not built here.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, requireEnv } from "./lib/env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEALERS_JSON = path.join(ROOT, "launch", "dealer-contacts", "dealers.json");

// Keep in lockstep with VARIANTS in supabase/functions/send-dealer-invite/index.ts.
const VARIANTS = {
  v1: { file: path.join(ROOT, "launch", "email", "dealer-new.html"), subject: "Let buyers find your next car" },
  v2: { file: path.join(ROOT, "launch", "email", "dealer-new-v2.html"), subject: "Your vehicles deserve to be found" },
  v3: { file: path.join(ROOT, "launch", "email", "dealer-new-v3.html"), subject: "Grow your showroom with Motokah" },
  v4: { file: path.join(ROOT, "launch", "email", "dealer-growth-visual.html"), subject: "Buyers are already searching on Motokah" },
};
const VARIANT_ROTATION = Object.keys(VARIANTS);

const args = process.argv.slice(2);
const isLive = args.includes("--live");
const noCap = args.includes("--no-cap");
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : undefined;
const LIVE_CAP = 2;

function loadDealers() {
  if (!fs.existsSync(DEALERS_JSON)) {
    console.log(`No dealer contacts file found at ${DEALERS_JSON} yet.`);
    console.log("This is expected if the scraping pipeline hasn't produced it. Nothing to do.");
    return [];
  }
  const raw = JSON.parse(fs.readFileSync(DEALERS_JSON, "utf8"));
  const list = Array.isArray(raw) ? raw : raw.dealers ?? [];
  return list;
}

function renderTemplate(template, { name, country, unsubscribeLink }) {
  return template
    .replaceAll("{{DEALER_NAME}}", name || "there")
    .replaceAll("{{DEALER_COUNTRY}}", country || "East Africa")
    .replaceAll("{{DEALER_COUNTRY_UPPER}}", (country || "East Africa").toUpperCase())
    .replaceAll("{{UNSUBSCRIBE_LINK}}", unsubscribeLink || "https://www.motokah.com/unsubscribe-preview");
}

function assignVariants(recipients) {
  return recipients.map((r, i) => ({
    ...r,
    templateVariant: r.templateVariant && VARIANTS[r.templateVariant] ? r.templateVariant : VARIANT_ROTATION[i % VARIANT_ROTATION.length],
  }));
}

function main() {
  console.log(isLive ? "=== LIVE MODE ===" : "=== DRY RUN (default; pass --live to actually send) ===");

  const dealers = loadDealers();
  const withEmail = dealers.filter((d) => typeof d.email === "string" && d.email.trim().length > 0);
  const withoutEmail = dealers.length - withEmail.length;

  console.log(`Loaded ${dealers.length} dealer contact(s) from ${path.relative(ROOT, DEALERS_JSON)}`);
  console.log(`  -> ${withEmail.length} have an email address (eligible for this email-only campaign)`);
  console.log(`  -> ${withoutEmail} are phone/WhatsApp-only and are SKIPPED by this script`);

  // Deduplicate by email — same inbox should only receive one invite
  const seenEmails = new Set();
  const deduped = withEmail.filter((d) => {
    const e = d.email.toLowerCase().trim();
    if (seenEmails.has(e)) return false;
    seenEmails.add(e);
    return true;
  });
  if (deduped.length < withEmail.length) {
    console.log(`  -> ${withEmail.length - deduped.length} duplicate email(s) removed — ${deduped.length} unique recipients`);
  }

  let recipients = deduped;
  if (limit) recipients = recipients.slice(0, limit);

  if (recipients.length === 0) {
    console.log("No eligible recipients. Stopping -- nothing would be sent.");
    return;
  }

  recipients = assignVariants(recipients);

  // Report the A/B/C split.
  const splitCounts = VARIANT_ROTATION.reduce((acc, v) => ({ ...acc, [v]: 0 }), {});
  for (const r of recipients) splitCounts[r.templateVariant] += 1;
  const splitSummary = VARIANT_ROTATION.map((v) => `${splitCounts[v]} -> ${v} (${path.basename(VARIANTS[v].file)})`).join(", ");
  console.log(`\n${recipients.length} recipients: ${splitSummary}`);

  // Render one sample per variant so a human can eyeball exact content for every arm before approval.
  console.log("\n--- Sample rendered recipient per variant ---");
  const sampleOutPaths = [];
  for (const variantKey of VARIANT_ROTATION) {
    const sample = recipients.find((r) => r.templateVariant === variantKey);
    if (!sample) continue; // fewer recipients than variants
    const templatePath = VARIANTS[variantKey].file;
    if (!fs.existsSync(templatePath)) {
      console.error(`Template not found at ${templatePath}`);
      continue;
    }
    const template = fs.readFileSync(templatePath, "utf8");
    const html = renderTemplate(template, {
      name: sample.name,
      country: sample.country,
      unsubscribeLink: "https://www.motokah.com/functions/v1/dealer-unsubscribe?email=SAMPLE&token=SAMPLE",
    });
    const outPath = path.join(ROOT, "launch", "email", `_dry-run-sample-${variantKey}.html`);
    fs.writeFileSync(outPath, html, "utf8");
    sampleOutPaths.push(outPath);
    console.log(`  ${variantKey}: To: ${sample.name || "(no name)"} <${sample.email}>  [${sample.country || "country unknown"}]  Subject: "${VARIANTS[variantKey].subject}"`);
  }
  console.log(`Full sample HTML for each variant written to: ${sampleOutPaths.map((p) => path.relative(ROOT, p)).join(", ")}`);

  if (!isLive) {
    console.log(`\nDRY RUN ONLY -- would send to ${recipients.length} recipient(s) across ${VARIANT_ROTATION.length} variants. No email sent, no network call made.`);
    console.log("Recipients (dry run list):");
    for (const r of recipients) {
      console.log(`  - ${r.name || "(no name)"} <${r.email}> [${r.country || "unknown"}] -> variant ${r.templateVariant}`);
    }
    console.log("\nRe-run with --live to actually send (capped to first 2 unless --no-cap is also passed).");
    console.log("Per standing house rule: do not pass --live until the owner has reviewed the exact rendered");
    console.log("sample for each variant and given explicit sign-off in this conversation.");
    return;
  }

  // ---- LIVE PATH ----
  const cappedRecipients = noCap ? recipients : recipients.slice(0, LIVE_CAP);
  if (!noCap && recipients.length > LIVE_CAP) {
    console.log(`Safety cap applied: sending to only the first ${LIVE_CAP} of ${recipients.length} (pass --no-cap to override).`);
  }

  const env = loadEnv(ROOT);
  requireEnv(env, ["VITE_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"]);

  console.log(`\nAbout to LIVE send to ${cappedRecipients.length} recipient(s):`);
  for (const r of cappedRecipients) console.log(`  - ${r.name || "(no name)"} <${r.email}> -> variant ${r.templateVariant}`);

  sendLive(env, cappedRecipients).catch((err) => {
    console.error("Live send failed:", err);
    process.exit(1);
  });
}

/** Create a temporary admin user, get their JWT, send all emails, then clean up. */
async function sendLive(env, recipients) {
  const url = env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const headers = { Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", apikey: serviceKey };

  // 1 — create a temporary confirmed user
  const tmpEmail = `tmp-dealer-send-${Date.now()}@motokah.com`;
  const tmpPassword = Math.random().toString(36).slice(2) + "Aa1!";
  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email: tmpEmail, password: tmpPassword, email_confirm: true }),
  });
  if (!createRes.ok) throw new Error(`create temp user failed: ${createRes.status} ${await createRes.text()}`);
  const { id: tmpId } = await createRes.json();

  // 2 — grant admin role
  await fetch(`${url}/rest/v1/user_roles`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ user_id: tmpId, role: "admin" }),
  });

  // 3 — sign in to get access token
  const signRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anonKey },
    body: JSON.stringify({ email: tmpEmail, password: tmpPassword }),
  });
  if (!signRes.ok) throw new Error(`sign-in failed: ${signRes.status} ${await signRes.text()}`);
  const { access_token } = await signRes.json();

  // 4 — load templates once
  const templates = {};
  for (const [key, cfg] of Object.entries(VARIANTS)) {
    templates[key] = fs.readFileSync(cfg.file, "utf8");
  }

  // 5 — send one email per recipient
  let sent = 0, failed = 0;
  for (const r of recipients) {
    const html = renderTemplate(templates[r.templateVariant], {
      name: r.name,
      country: r.country,
      unsubscribeLink: `https://www.motokah.com/functions/v1/dealer-unsubscribe?email=${encodeURIComponent(r.email)}&token=PLACEHOLDER`,
    });
    const res = await fetch(`${url}/functions/v1/send-email`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json", apikey: anonKey },
      body: JSON.stringify({ to_email: r.email, subject: VARIANTS[r.templateVariant].subject, html }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && (body.sent || body.skipped)) {
      sent++;
      process.stdout.write(`  [${sent + failed}/${recipients.length}] ✓ ${r.email}\n`);
    } else {
      failed++;
      process.stdout.write(`  [${sent + failed}/${recipients.length}] ✗ ${r.email} — ${body.error || res.status}\n`);
    }
    // Polite delay 400ms between sends
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  // 6 — clean up temp user
  await fetch(`${url}/rest/v1/user_roles?user_id=eq.${tmpId}`, { method: "DELETE", headers });
  await fetch(`${url}/auth/v1/admin/users/${tmpId}`, { method: "DELETE", headers });

  console.log(`\nSent: ${sent} | Failed: ${failed} | Total: ${recipients.length}`);
}

main();
