#!/usr/bin/env node
/**
 * Motokah — Google Maps Car Dealer Scraper
 *
 * Uses Playwright (already installed) to scrape Google Maps for car showrooms
 * across East Africa. Gets real phone numbers, websites, ratings and addresses.
 *
 * USAGE:
 *   node scripts/scrape-dealers-gmaps.js              ← scrape all cities
 *   node scripts/scrape-dealers-gmaps.js --city "Nairobi"
 *   node scripts/scrape-dealers-gmaps.js --visible    ← show browser window (for debugging)
 *
 * OUTPUT:
 *   scripts/dealers-output.json  ← copy array into src/data/dealers-scraped.json
 *
 * NOTE: This is slow by design (1–2s delays per listing) to avoid rate limiting.
 * Expect ~10–20 min for all cities. Run city by city if you need it faster.
 */

import { chromium } from "@playwright/test";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = join(__dirname, "dealers-output.json");
const VISIBLE = process.argv.includes("--visible");
const CITY_FILTER = process.argv.includes("--city")
  ? process.argv[process.argv.indexOf("--city") + 1]
  : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CITIES = [
  // Tanzania
  { name: "Dar es Salaam", country: "Tanzania", countryCode: "255" },
  { name: "Arusha",        country: "Tanzania", countryCode: "255" },
  { name: "Mwanza",        country: "Tanzania", countryCode: "255" },
  { name: "Zanzibar",      country: "Tanzania", countryCode: "255" },
  { name: "Dodoma",        country: "Tanzania", countryCode: "255" },
  { name: "Tanga",         country: "Tanzania", countryCode: "255" },
  { name: "Moshi",         country: "Tanzania", countryCode: "255" },
  { name: "Mbeya",         country: "Tanzania", countryCode: "255" },
  // Kenya
  { name: "Nairobi",       country: "Kenya",    countryCode: "254" },
  { name: "Mombasa",       country: "Kenya",    countryCode: "254" },
  { name: "Kisumu",        country: "Kenya",    countryCode: "254" },
  { name: "Nakuru",        country: "Kenya",    countryCode: "254" },
  { name: "Eldoret",       country: "Kenya",    countryCode: "254" },
  { name: "Thika",         country: "Kenya",    countryCode: "254" },
  // Uganda
  { name: "Kampala",       country: "Uganda",   countryCode: "256" },
  { name: "Entebbe",       country: "Uganda",   countryCode: "256" },
  { name: "Jinja",         country: "Uganda",   countryCode: "256" },
  { name: "Gulu",          country: "Uganda",   countryCode: "256" },
  // Rwanda
  { name: "Kigali",        country: "Rwanda",   countryCode: "250" },
  // Ethiopia
  { name: "Addis Ababa",   country: "Ethiopia", countryCode: "251" },
];

const QUERIES = ["car showroom", "car dealer", "car sales"];

function cleanPhone(raw, countryCode) {
  if (!raw) return undefined;
  if (Array.isArray(raw)) raw = raw[0];
  if (typeof raw !== "string") return undefined;
  let digits = raw.replace(/[^\d+]/g, "");
  const hasPlus = digits.startsWith("+");
  if (hasPlus) digits = digits.slice(1);
  if (digits.startsWith("0") && digits.length <= 10) digits = countryCode + digits.slice(1);
  const CODES = ["255", "254", "256", "250", "251", "44", "1"];
  for (const c of CODES) {
    if (digits.startsWith(c)) return "+" + digits;
  }
  return (hasPlus || digits.length >= 10) ? "+" + digits : undefined;
}

async function scrollFeedToEnd(page) {
  // Scroll the results feed until no more new results load
  const feed = page.locator('[role="feed"]');
  let lastCount = 0;
  for (let i = 0; i < 15; i++) {
    const items = await page.locator('[role="feed"] > div > div').count();
    if (items === lastCount && i > 1) break;
    lastCount = items;
    await feed.evaluate((el) => el.scrollBy(0, el.scrollHeight));
    await sleep(1200);
    // Check if we hit the end
    const endMsg = await page.locator('text="You\'ve reached the end of the list"').count();
    if (endMsg > 0) break;
  }
}

async function scrapeCity(page, city, query, seenNames) {
  const dealers = [];
  const searchQuery = `${query} in ${city.name} ${city.country}`;
  const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

  console.log(`  → Searching: "${searchQuery}"`);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
  } catch {
    console.log("    ⚠️  Page load timeout, continuing...");
  }

  await sleep(2000);

  // Dismiss cookie/consent dialogs if present
  try {
    const accept = page.locator('button:has-text("Accept all"), button:has-text("Reject all"), button[aria-label*="Accept"]');
    if (await accept.first().isVisible({ timeout: 2000 })) {
      await accept.first().click();
      await sleep(500);
    }
  } catch { /* no dialog */ }

  // Wait for results feed
  try {
    await page.waitForSelector('[role="feed"]', { timeout: 8000 });
  } catch {
    console.log("    ⚠️  No results feed found");
    return dealers;
  }

  await scrollFeedToEnd(page);

  // Collect all listing links
  const links = await page.evaluate(() => {
    const anchors = document.querySelectorAll('[role="feed"] a[href*="/maps/place/"]');
    const seen = new Set();
    return Array.from(anchors)
      .map((a) => a.href)
      .filter((href) => {
        if (seen.has(href)) return false;
        seen.add(href);
        return true;
      });
  });

  console.log(`    Found ${links.length} listings`);

  for (const link of links) {
    try {
      await page.goto(link, { waitUntil: "domcontentloaded", timeout: 15000 });
      await sleep(1000);

      const data = await page.evaluate(() => {
        // Name
        const name =
          document.querySelector('h1')?.textContent?.trim() ||
          document.querySelector('[data-item-id="title"] .fontHeadlineLarge')?.textContent?.trim();

        // Phone — Google Maps stores it in data-item-id="phone:tel:..."
        const phoneEl = document.querySelector('[data-item-id*="phone"]');
        const phone = phoneEl?.textContent?.trim() || phoneEl?.getAttribute("aria-label")?.replace("Phone:", "").trim();

        // Website
        const websiteEl = document.querySelector('[data-item-id="authority"]');
        const website = websiteEl?.textContent?.trim();

        // Address
        const addressEl = document.querySelector('[data-item-id*="address"]');
        const address = addressEl?.textContent?.trim();

        // Rating
        const ratingEl = document.querySelector('[aria-label*="stars"]') || document.querySelector('span[role="img"][aria-label]');
        const ratingText = ratingEl?.getAttribute("aria-label") || "";
        const ratingMatch = ratingText.match(/(\d+\.?\d*)\s*star/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

        return { name, phone, website, address, rating };
      });

      if (!data.name || data.name.length < 2) continue;
      if (seenNames.has(data.name.toLowerCase())) continue;
      seenNames.add(data.name.toLowerCase());

      const phone = cleanPhone(data.phone, city.countryCode);
      const dealer = {
        id: `gm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: data.name,
        city: city.name,
        country: city.country,
        phone,
        whatsapp: phone,
        email: undefined,
        website: data.website || undefined,
        address: data.address || undefined,
        rating: data.rating || undefined,
        source: "google_maps",
      };

      dealers.push(dealer);
      console.log(`    ✅  ${dealer.name}${dealer.phone ? " — " + dealer.phone : ""}`);

      await sleep(800);
    } catch (err) {
      // Skip failed listings silently
    }
  }

  return dealers;
}

async function main() {
  const citiesToScrape = CITY_FILTER
    ? CITIES.filter((c) => c.name.toLowerCase() === CITY_FILTER.toLowerCase())
    : CITIES;

  if (citiesToScrape.length === 0) {
    console.error(`No city matching "${CITY_FILTER}". Options: ${CITIES.map(c => c.name).join(", ")}`);
    process.exit(1);
  }

  // Load existing output to merge with (don't overwrite previous runs)
  let existing = [];
  if (existsSync(OUTPUT_FILE)) {
    try { existing = JSON.parse(readFileSync(OUTPUT_FILE, "utf8")); } catch { /* empty */ }
  }
  const seenNames = new Set(existing.map((d) => d.name?.toLowerCase()).filter(Boolean));
  const allDealers = [...existing];

  const browser = await chromium.launch({
    headless: !VISIBLE,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale: "en-US",
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  try {
    for (const city of citiesToScrape) {
      console.log(`\n🔍  Scraping ${city.name}, ${city.country}...`);
      let cityTotal = 0;

      for (const query of QUERIES) {
        const dealers = await scrapeCity(page, city, query, seenNames);
        allDealers.push(...dealers);
        cityTotal += dealers.length;
        await sleep(1500);
      }

      console.log(`  → ${cityTotal} new dealers from ${city.name}`);
      // Save after each city in case of crash
      writeFileSync(OUTPUT_FILE, JSON.stringify(allDealers, null, 2));
    }
  } finally {
    await browser.close();
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(allDealers, null, 2));
  console.log(`\n✨  Done! ${allDealers.length} total dealers in ${OUTPUT_FILE}`);
  console.log(`\nNext: copy array into src/data/dealers-scraped.json then rebuild.\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
