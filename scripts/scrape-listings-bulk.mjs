/**
 * scrape-listings-bulk.mjs
 *
 * Scrapes car listings from jiji.co.tz and cartanzania.com using Playwright
 * (stealth mode to bypass Cloudflare). Outputs JSON in the exact format of
 * public/data/jiji-tz.json, then optionally imports to Supabase.
 *
 * Install deps first (one-time):
 *   npm install playwright playwright-extra puppeteer-extra-plugin-stealth
 *   npx playwright install chromium
 *
 * Usage:
 *   node scripts/scrape-listings-bulk.mjs --source jiji-tz --pages 50
 *   node scripts/scrape-listings-bulk.mjs --source jiji-ke --pages 30
 *   node scripts/scrape-listings-bulk.mjs --source cartanzania --pages 20
 *   node scripts/scrape-listings-bulk.mjs --source all --pages 50
 *
 * Flags:
 *   --source  jiji-tz | jiji-ke | jiji-ug | cartanzania | all  (default: jiji-tz)
 *   --pages   max pages to scrape per source (default: 50, 24 listings/page = ~1200/run)
 *   --import  also import scraped listings to Supabase (requires SERVICE_ROLE_KEY)
 *   --dry     print first 3 listings only, don't write files
 *
 * Output: public/data/scraped-{source}.json (merged into existing jiji-{country}.json
 * if --merge flag is passed)
 */

import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
config({ path: join(ROOT, ".env.local") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── CLI args ─────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const getArg  = (flag, def) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : def; };
const hasFlag = (flag) => args.includes(flag);

const SOURCE  = getArg("--source", "jiji-tz");
const PAGES   = parseInt(getArg("--pages", "50"), 10);
const DRY     = hasFlag("--dry");
const DO_IMPORT = hasFlag("--import");
const MERGE   = hasFlag("--merge");

// ── Source configs ────────────────────────────────────────────────────────────
const SOURCES = {
  "jiji-tz": {
    country: "TZ",
    currency: "TZS",
    idPrefix: "jiji",
    pageUrl: (p) => `https://jiji.co.tz/cars?page=${p}`,
    listingSelector: ".qa-advert-list-item",
    extract: extractJiji,
    outFile: "jiji-tz.json",
  },
  "jiji-ke": {
    country: "KE",
    currency: "KES",
    idPrefix: "jiji",
    pageUrl: (p) => `https://jiji.co.ke/cars?page=${p}`,
    listingSelector: ".qa-advert-list-item",
    extract: extractJiji,
    outFile: "jiji-ke.json",
  },
  "jiji-ug": {
    country: "UG",
    currency: "UGX",
    idPrefix: "jiji",
    pageUrl: (p) => `https://jiji.ug/cars?page=${p}`,
    listingSelector: ".qa-advert-list-item",
    extract: extractJiji,
    outFile: "jiji-ug.json",
  },
  "cartanzania": {
    country: "TZ",
    currency: "TZS",
    idPrefix: "ct",
    pageUrl: (p) => `https://www.cartanzania.com/cars-for-sale?page=${p}`,
    listingSelector: ".car-item, .listing-item, article[class*='car']",
    extract: extractCarTanzania,
    outFile: "scraped-cartanzania.json",
  },
};

// ── Jiji extractor ────────────────────────────────────────────────────────────
async function extractJiji(page, source) {
  return page.evaluate((src) => {
    const items = document.querySelectorAll(".qa-advert-list-item");
    return Array.from(items).map((el) => {
      const titleEl  = el.querySelector(".qa-advert-title, h3, .b-list-advert__item-title");
      const priceEl  = el.querySelector(".qa-advert-price, .b-list-advert__item-price");
      const imgEl    = el.querySelector("img");
      const linkEl   = el.querySelector("a[href*='/cars/']");
      const locEl    = el.querySelector(".b-list-advert__item__details, .qa-advert-location");

      const title    = titleEl?.textContent?.trim() || "";
      const priceRaw = priceEl?.textContent?.replace(/[^\d]/g, "") || "0";
      const price    = parseInt(priceRaw, 10) || 0;
      const img      = imgEl?.src || imgEl?.dataset?.src || "";
      const url      = linkEl ? "https://jiji.co.tz" + linkEl.getAttribute("href") : "";
      const loc      = locEl?.textContent?.trim() || "";

      // Try to parse year from title: "2015 Toyota..." or "Toyota... 2015"
      const yearMatch = title.match(/\b(19[89]\d|20[012]\d)\b/);
      const year      = yearMatch ? parseInt(yearMatch[1], 10) : null;

      // Try to parse make/model
      const makeMatch = title.match(/\b(Toyota|Mazda|Nissan|Subaru|Honda|Mitsubishi|Mercedes|BMW|Suzuki|Isuzu|Hyundai|Kia|Ford|Volkswagen|Land Rover|Jeep|Peugeot|Renault)\b/i);
      const make      = makeMatch ? makeMatch[1] : null;

      // Hash URL to make stable ID
      const hash = url.split("/").pop()?.split("?")[0]?.slice(-12) || Math.random().toString(36).slice(2, 14);
      const id   = `${src.idPrefix}-${hash}`;

      return { id, title, price, currency: src.currency, year, make, model: title, location: loc, image: img, images: img ? [img] : [], country: src.country, sourceUrl: url, condition: "Foreign Used", sellerName: "Jiji Listing", sellerRating: 4, sellerType: "private", views: 0, sellerListingCount: 1, sellerPhone: "", badge: null, bodyType: null, fuelType: null, cc: null, color: null, mileage: null, transmission: null, dutyPaid: false, description: null };
    }).filter(l => l.title && l.price > 0);
  }, source);
}

// ── CarTanzania extractor ─────────────────────────────────────────────────────
async function extractCarTanzania(page, source) {
  return page.evaluate((src) => {
    // Try multiple selectors — cartanzania structure may vary
    const selectors = [".car-item", ".listing-card", "article", ".vehicle-card", ".advert-item"];
    let items = [];
    for (const sel of selectors) {
      const found = document.querySelectorAll(sel);
      if (found.length > 2) { items = Array.from(found); break; }
    }
    return items.map((el) => {
      const title    = el.querySelector("h2, h3, .title, .car-title")?.textContent?.trim() || "";
      const priceRaw = el.querySelector(".price, .car-price, [class*='price']")?.textContent?.replace(/[^\d]/g, "") || "0";
      const price    = parseInt(priceRaw, 10) || 0;
      const img      = el.querySelector("img")?.src || "";
      const link     = el.querySelector("a")?.href || "";
      const loc      = el.querySelector(".location, .city, [class*='location']")?.textContent?.trim() || "Tanzania";

      const yearMatch = title.match(/\b(19[89]\d|20[012]\d)\b/);
      const year      = yearMatch ? parseInt(yearMatch[1], 10) : null;
      const makeMatch = title.match(/\b(Toyota|Mazda|Nissan|Subaru|Honda|Mitsubishi|Mercedes|BMW|Suzuki|Isuzu)\b/i);
      const make      = makeMatch ? makeMatch[1] : null;

      const hash = link.split("/").filter(Boolean).pop()?.slice(0, 12) || Math.random().toString(36).slice(2, 14);
      const id   = `${src.idPrefix}-${hash}`;

      return { id, title, price, currency: src.currency, year, make, model: title, location: loc, image: img, images: img ? [img] : [], country: src.country, sourceUrl: link, condition: "Foreign Used", sellerName: "Car Tanzania", sellerRating: 4, sellerType: "dealer", views: 0, sellerListingCount: 1, sellerPhone: "", badge: null, bodyType: null, fuelType: null, cc: null, color: null, mileage: null, transmission: null, dutyPaid: false, description: null };
    }).filter(l => l.title && l.price > 0);
  }, source);
}

// ── Supabase import ───────────────────────────────────────────────────────────
async function importToSupabase(listings) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("Need SUPABASE_SERVICE_ROLE_KEY in .env.local for --import");
    return;
  }
  const BATCH = 100;
  let imported = 0;
  for (let i = 0; i < listings.length; i += BATCH) {
    const batch = listings.slice(i, i + BATCH).map(l => ({
      title:        l.title,
      price:        l.price,
      currency:     l.currency,
      year:         l.year,
      make:         l.make,
      model:        l.model,
      condition:    l.condition,
      location:     l.location,
      city:         l.location?.split(",")[0]?.trim() || l.location,
      images:       l.images,
      status:       "approved",
      source_url:   l.sourceUrl,
      external_id:  l.id,
      body_type:    l.bodyType,
      fuel_type:    l.fuelType,
      mileage:      l.mileage,
      transmission: l.transmission,
      color:        l.color,
      engine_cc:    l.cc,
      description:  l.description,
    }));
    const res = await fetch(`${SUPABASE_URL}/rest/v1/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Prefer": "resolution=ignore-duplicates",
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      console.error(`Batch ${i}-${i + BATCH} failed: ${res.status} ${await res.text()}`);
    } else {
      imported += batch.length;
      process.stdout.write(`\rImported ${imported}/${listings.length}...`);
    }
  }
  console.log(`\nImported ${imported} listings to Supabase.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function scrapeSource(srcKey, cfg) {
  console.log(`\n[${srcKey}] Scraping up to ${PAGES} pages → ${cfg.outFile}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
    extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
  });
  const page = await context.newPage();
  // Block heavy assets to speed up
  await page.route("**/*.{png,jpg,jpeg,webp,gif,svg,woff,woff2,mp4,mp3}", r => r.abort());

  const all = [];
  let emptyPages = 0;

  for (let p = 1; p <= PAGES; p++) {
    const url = cfg.pageUrl(p);
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      // Wait a beat for any JS rendering
      await page.waitForTimeout(1500);

      const listings = await cfg.extract(page, cfg);
      if (listings.length === 0) {
        emptyPages++;
        if (emptyPages >= 3) { console.log(`  Stopped at page ${p} (3 consecutive empty pages)`); break; }
        continue;
      }
      emptyPages = 0;
      all.push(...listings);
      process.stdout.write(`  Page ${p}: +${listings.length} (total ${all.length})\r`);
    } catch (err) {
      console.error(`  Page ${p} error: ${err.message}`);
      emptyPages++;
      if (emptyPages >= 5) break;
    }
    // Polite delay 0.8–1.8s between pages
    await page.waitForTimeout(800 + Math.random() * 1000);
  }

  await browser.close();
  console.log(`\n[${srcKey}] Scraped ${all.length} listings`);

  if (DRY) {
    console.log("DRY — first 3 listings:");
    console.log(JSON.stringify(all.slice(0, 3), null, 2));
    return all;
  }

  // Deduplicate by ID
  const unique = Array.from(new Map(all.map(l => [l.id, l])).values());
  console.log(`[${srcKey}] Unique: ${unique.length}`);

  if (MERGE) {
    // Merge with existing file
    const outPath = join(ROOT, "public/data", cfg.outFile);
    const existing = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf-8")) : [];
    const existingIds = new Set(existing.map(l => l.id));
    const fresh = unique.filter(l => !existingIds.has(l.id));
    const merged = [...existing, ...fresh];
    writeFileSync(outPath, JSON.stringify(merged, null, 2));
    console.log(`[${srcKey}] Merged ${fresh.length} new listings → ${merged.length} total in ${cfg.outFile}`);
  } else {
    const outPath = join(ROOT, "public/data", `scraped-${srcKey}.json`);
    writeFileSync(outPath, JSON.stringify(unique, null, 2));
    console.log(`[${srcKey}] Written to ${outPath}`);
  }

  return unique;
}

async function main() {
  const sources = SOURCE === "all" ? Object.keys(SOURCES) : [SOURCE];
  let allListings = [];
  for (const src of sources) {
    if (!SOURCES[src]) { console.error(`Unknown source: ${src}`); continue; }
    const listings = await scrapeSource(src, SOURCES[src]);
    allListings.push(...listings);
  }

  if (DO_IMPORT && allListings.length > 0) {
    await importToSupabase(allListings);
  }

  console.log(`\nDone. Total collected: ${allListings.length} listings.`);
}

main().catch(console.error);
