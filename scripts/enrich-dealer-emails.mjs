/**
 * enrich-dealer-emails.mjs
 *
 * Fetches each dealer's website to extract email addresses,
 * then writes them back into launch/dealer-contacts/dealers.json.
 *
 * Usage:
 *   node scripts/enrich-dealer-emails.mjs           # process all dealers with websites
 *   node scripts/enrich-dealer-emails.mjs --limit 50 # first 50 only
 *   node scripts/enrich-dealer-emails.mjs --dry      # print without writing
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DEALERS_PATH = join(ROOT, "launch/dealer-contacts/dealers.json");

const args     = process.argv.slice(2);
const DRY      = args.includes("--dry");
const limitArg = args.find(a => a.startsWith("--limit=") || a === "--limit");
const LIMIT    = limitArg ? parseInt(args[args.indexOf("--limit") + 1] ?? limitArg.split("=")[1], 10) : Infinity;

const CONCURRENCY = 12; // parallel fetches

// Swallow unhandled HTTP/2 GOAWAY errors from aggressive sites
process.on("uncaughtException", (err) => {
  if (err.code === "ERR_HTTP2_SESSION_ERROR" || err.code === "ECONNRESET") return;
  throw err;
});
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SKIP_DOMAINS = ["sentry.io","wixpress.com","example.com","yoursite.com","yourstore.com","domain.com","email.com","wordpress.com","logo","icon","png","jpg","gif","svg","placeholder","noreply","no-reply","test.com","sample.com","company.com"];

function extractEmails(text) {
  const matches = text.match(EMAIL_RE) || [];
  return [...new Set(matches)].filter(e => {
    const lower = e.toLowerCase();
    return !SKIP_DOMAINS.some(s => lower.includes(s)) && e.length < 60;
  });
}

async function fetchPage(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("html")) return null;
    return await res.text();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

async function extractEmailsFromSite(baseUrl) {
  // Homepage only — most sites surface email on the front page or in footer
  try {
    const html = await fetchPage(baseUrl, 3000);
    if (!html) return [];
    const mailto = [...html.matchAll(/mailto:([^"'>\s?]+)/g)].map(m => m[1]);
    const all = new Set([...mailto, ...extractEmails(html)]);
    return [...all];
  } catch {
    return [];
  }
}

async function main() {
  const raw = JSON.parse(readFileSync(DEALERS_PATH, "utf-8"));
  const list = Array.isArray(raw) ? raw : raw.dealers ?? raw;

  const toProcess = list.filter(d =>
    d.website &&
    d.website.startsWith("http") &&
    !d.website.includes("linkedin") &&
    !d.website.includes("facebook") &&
    !d.website.includes("t.me") &&
    !d.website.includes("instagram") &&
    !d.website.includes("twitter") &&
    !d.website.includes("youtube") &&
    (!d.email || d.email.trim() === "")
  ).slice(0, LIMIT === Infinity ? 9999 : LIMIT);

  console.log(`Processing ${toProcess.length} dealers (${CONCURRENCY} concurrent)…\n`);

  let found = 0;
  let done  = 0;

  // Process in parallel batches
  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const batch = toProcess.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (dealer) => {
      try {
        const emails = await extractEmailsFromSite(dealer.website);
        return { dealer, emails };
      } catch {
        return { dealer, emails: [] };
      }
    }));

    for (const { dealer, emails } of results) {
      done++;
      const label = `[${done}/${toProcess.length}] ${dealer.name.slice(0, 35).padEnd(35)}`;
      if (emails.length > 0) {
        dealer.email = emails[0];
        dealer.emailAlternatives = emails.slice(1);
        found++;
        console.log(`${label} ✓ ${emails[0]}`);
      } else {
        console.log(`${label} – no email`);
      }
    }
  }

  console.log(`\nFound ${found} email addresses.`);

  if (!DRY) {
    writeFileSync(DEALERS_PATH, JSON.stringify(list, null, 2));
    console.log(`Updated ${DEALERS_PATH}`);
    const withEmail = list.filter(d => d.email && d.email.trim());
    console.log(`Total dealers with email now: ${withEmail.length} / ${list.length}`);
  }
}

main().catch(console.error);
