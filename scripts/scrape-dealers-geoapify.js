#!/usr/bin/env node
/**
 * Motokah — East Africa Car Dealer Scraper (Geoapify version)
 *
 * Uses the Geoapify Places API — FREE tier, no credit card required.
 * Free tier gives 3,000 API calls per day — more than enough to scrape all cities.
 *
 * HOW TO GET YOUR FREE API KEY (2 minutes, no credit card):
 *   1. Go to https://myprojects.geoapify.com/
 *   2. Click "Sign Up" — just email + password
 *   3. Create a new project
 *   4. Copy the API key shown on the project page
 *
 * USAGE:
 *   GEOAPIFY_KEY=your_key node scripts/scrape-dealers-geoapify.js
 *   GEOAPIFY_KEY=your_key node scripts/scrape-dealers-geoapify.js --city "Nairobi"
 *   node scripts/scrape-dealers-geoapify.js --dry-run
 *
 * OUTPUT:
 *   scripts/dealers-output.json
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = join(__dirname, "dealers-output.json");
const DRY_RUN = process.argv.includes("--dry-run");
const CITY_FILTER = process.argv.includes("--city")
  ? process.argv[process.argv.indexOf("--city") + 1]
  : null;

const API_KEY = process.env.GEOAPIFY_KEY;

// ─── Cities ───────────────────────────────────────────────────────────────────
const CITIES = [
  { name: "Dar es Salaam", country: "Tanzania",  countryCode: "255", lat: -6.7924,  lon: 39.2083 },
  { name: "Arusha",        country: "Tanzania",  countryCode: "255", lat: -3.3869,  lon: 36.6830 },
  { name: "Mwanza",        country: "Tanzania",  countryCode: "255", lat: -2.5164,  lon: 32.9175 },
  { name: "Zanzibar",      country: "Tanzania",  countryCode: "255", lat: -6.1659,  lon: 39.1989 },
  { name: "Nairobi",       country: "Kenya",     countryCode: "254", lat: -1.2921,  lon: 36.8219 },
  { name: "Mombasa",       country: "Kenya",     countryCode: "254", lat: -4.0435,  lon: 39.6682 },
  { name: "Kisumu",        country: "Kenya",     countryCode: "254", lat: -0.0917,  lon: 34.7680 },
  { name: "Kampala",       country: "Uganda",    countryCode: "256", lat:  0.3476,  lon: 32.5825 },
  { name: "Kigali",        country: "Rwanda",    countryCode: "250", lat: -1.9441,  lon: 30.0619 },
  { name: "Addis Ababa",   country: "Ethiopia",  countryCode: "251", lat:  9.0320,  lon: 38.7469 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Phone cleaning ───────────────────────────────────────────────────────────
function cleanPhone(raw, defaultCountryCode) {
  if (!raw) return undefined;
  let digits = raw.replace(/[^\d+]/g, "");
  const hasPlus = digits.startsWith("+");
  if (hasPlus) digits = digits.slice(1);
  if (digits.startsWith("0") && digits.length <= 10) {
    digits = defaultCountryCode + digits.slice(1);
  }
  const AFRICAN_CODES = ["255", "254", "256", "250", "251"];
  for (const code of AFRICAN_CODES) {
    if (digits.startsWith(code)) return "+" + digits;
  }
  return (hasPlus || digits.length >= 10) ? "+" + digits : undefined;
}

// ─── Geoapify Places API ──────────────────────────────────────────────────────
// Categories for car dealers / showrooms
// Full category list: https://apidocs.geoapify.com/docs/places/#categories
const CATEGORIES = "commercial.vehicle_dealer,commercial.car_dealer,commercial.car_parts";
const RADIUS = 30000; // 30km
const LIMIT = 500;    // max per request

async function fetchDealers(city) {
  const url = new URL("https://api.geoapify.com/v2/places");
  url.searchParams.set("categories", CATEGORIES);
  url.searchParams.set("filter", `circle:${city.lon},${city.lat},${RADIUS}`);
  url.searchParams.set("bias", `proximity:${city.lon},${city.lat}`);
  url.searchParams.set("limit", String(LIMIT));
  url.searchParams.set("lang", "en");
  url.searchParams.set("apiKey", API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.features || [];
}

// ─── Convert Geoapify feature → dealer object ─────────────────────────────────
function featureToDealer(feature, city) {
  const p = feature.properties || {};

  const name = p.name;
  if (!name) return null;

  const rawPhone = p.contact?.phone || p.phone;
  const phone = cleanPhone(rawPhone, city.countryCode);
  const email = p.contact?.email || p.email;
  const website = p.website || p.contact?.website;
  const address = p.formatted || p.address_line1;
  const brand = p.brand ? [p.brand] : undefined;

  return {
    id: `geo-${feature.properties.place_id || Math.random().toString(36).slice(2)}`,
    name,
    city: city.name,
    country: city.country,
    phone,
    whatsapp: phone,
    email: email || undefined,
    website: website || undefined,
    address: address || undefined,
    brand,
    rating: undefined,
    source: "geoapify",
  };
}

// ─── Dry run sample ───────────────────────────────────────────────────────────
const DRY_RUN_SAMPLE = [
  { id: "geo-sample-1", name: "Toyota Tanzania Ltd", city: "Dar es Salaam", country: "Tanzania",
    phone: "+255222863050", whatsapp: "+255222863050", website: "https://www.toyota.co.tz", source: "geoapify" },
  { id: "geo-sample-2", name: "CMC Motors", city: "Nairobi", country: "Kenya",
    phone: "+254202698000", whatsapp: "+254202698000", website: "https://www.cmcmotors.com", source: "geoapify" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (DRY_RUN) {
    console.log("=== DRY RUN — no API calls ===\n");
    console.log(JSON.stringify(DRY_RUN_SAMPLE, null, 2));
    writeFileSync(OUTPUT_FILE, JSON.stringify(DRY_RUN_SAMPLE, null, 2));
    console.log(`\nWritten to ${OUTPUT_FILE}`);
    return;
  }

  if (!API_KEY) {
    console.error([
      "",
      "❌  GEOAPIFY_KEY is not set.",
      "",
      "   Get your FREE key (no credit card) in 2 minutes:",
      "   1. Go to https://myprojects.geoapify.com/",
      "   2. Sign up with email + password",
      "   3. Create a project → copy the API key",
      "",
      "   Then run:",
      "   GEOAPIFY_KEY=your_key node scripts/scrape-dealers-geoapify.js",
      "",
    ].join("\n"));
    process.exit(1);
  }

  const citiesToScrape = CITY_FILTER
    ? CITIES.filter((c) => c.name.toLowerCase() === CITY_FILTER.toLowerCase())
    : CITIES;

  if (citiesToScrape.length === 0) {
    console.error(`No city matching "${CITY_FILTER}". Options: ${CITIES.map(c => c.name).join(", ")}`);
    process.exit(1);
  }

  const dealers = [];
  const seenIds = new Set();

  for (const city of citiesToScrape) {
    console.log(`\n🔍  Searching car dealers in ${city.name}, ${city.country}...`);

    let features;
    try {
      features = await fetchDealers(city);
    } catch (err) {
      console.error(`  ⚠️  Failed: ${err.message}`);
      continue;
    }

    console.log(`  Found ${features.length} results`);
    let added = 0;

    for (const feature of features) {
      const id = feature.properties?.place_id;
      if (id && seenIds.has(id)) continue;
      if (id) seenIds.add(id);

      const dealer = featureToDealer(feature, city);
      if (!dealer) continue;

      dealers.push(dealer);
      added++;
      console.log(`  ✅  ${dealer.name}${dealer.phone ? " — " + dealer.phone : ""}`);
    }

    console.log(`  → Added ${added} dealers from ${city.name}`);

    // Respect rate limits — 1 request per second on free tier is safe
    if (citiesToScrape.indexOf(city) < citiesToScrape.length - 1) {
      await sleep(1100);
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(dealers, null, 2));
  console.log(`\n✨  Done! ${dealers.length} dealers written to ${OUTPUT_FILE}`);
  console.log(`\nNext: copy the array from ${OUTPUT_FILE} into src/data/dealers.ts\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
