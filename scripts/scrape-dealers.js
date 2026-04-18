#!/usr/bin/env node
/**
 * Motokah — East Africa Car Dealer Scraper
 *
 * Uses the OpenStreetMap Overpass API — 100% FREE, no API key, no billing.
 * Queries OSM data for car showrooms/dealers tagged in each East African city.
 *
 * USAGE:
 *   node scripts/scrape-dealers.js              ← scrape all cities
 *   node scripts/scrape-dealers.js --dry-run    ← print sample output, no network calls
 *   node scripts/scrape-dealers.js --city "Nairobi"  ← single city only
 *
 * OUTPUT:
 *   scripts/dealers-output.json    ← paste into src/data/dealers.ts to update the page
 *
 * NOTE: Overpass is a free shared service. If you see "server too busy" errors,
 * wait 10-15 minutes and try again — it's just temporary load. No sign-up ever needed.
 *
 * ALTERNATIVE (also free, more reliable, needs a free API key — no credit card):
 *   1. Sign up at https://myprojects.geoapify.com/ (free, no card)
 *   2. Create a project → copy your API key
 *   3. Run: GEOAPIFY_KEY=your_key node scripts/scrape-dealers-geoapify.js
 *
 * HOW IT WORKS:
 *   The Overpass API lets you query OpenStreetMap data using bounding boxes or
 *   radius searches. We search for nodes/ways tagged shop=car or amenity=car_dealer
 *   within 30km of each city centre. OSM community members tag real businesses with
 *   name, phone, email, website, brand — all returned in the response.
 *
 *   Overpass API limits: ~10,000 requests/day, max 1 concurrent query per IP.
 *   We sleep 1s between city queries to be polite.
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

// ─── City centres (lat, lon) ──────────────────────────────────────────────────
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

const RADIUS_METERS = 30000; // 30km radius around each city centre
// Multiple Overpass mirrors — falls back if one is overloaded
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Overpass query builder ───────────────────────────────────────────────────
function buildQuery(lat, lon) {
  // Search for car dealers using the two most common OSM tags
  // "around:radius,lat,lon" finds elements within the radius
  return `
[out:json][timeout:30];
(
  node["shop"="car"](around:${RADIUS_METERS},${lat},${lon});
  node["amenity"="car_dealer"](around:${RADIUS_METERS},${lat},${lon});
  way["shop"="car"](around:${RADIUS_METERS},${lat},${lon});
  way["amenity"="car_dealer"](around:${RADIUS_METERS},${lat},${lon});
);
out body;
`.trim();
}

// ─── Phone cleaning ───────────────────────────────────────────────────────────
function cleanPhone(raw, defaultCountryCode) {
  if (!raw) return undefined;
  let digits = raw.replace(/[^\d+]/g, "");
  const hasPlus = digits.startsWith("+");
  if (hasPlus) digits = digits.slice(1);

  // Local 0xxx → prepend country code
  if (digits.startsWith("0") && digits.length <= 10) {
    digits = defaultCountryCode + digits.slice(1);
  }

  // Ensure African numbers have + prefix
  const AFRICAN_CODES = ["255", "254", "256", "250", "251"];
  for (const code of AFRICAN_CODES) {
    if (digits.startsWith(code)) return "+" + digits;
  }

  return (hasPlus || digits.length >= 10) ? "+" + digits : undefined;
}

// ─── Tag extraction ───────────────────────────────────────────────────────────
// OSM elements have a `tags` object. Different contributors use different tag names.
function extractTag(tags, ...keys) {
  for (const k of keys) {
    if (tags[k]) return tags[k];
  }
  return undefined;
}

function osmElementToDealer(el, city, countryCode, idCounter) {
  const t = el.tags || {};

  const name = extractTag(t, "name", "brand", "operator");
  if (!name) return null; // skip unnamed elements

  const rawPhone = extractTag(t, "phone", "contact:phone", "mobile", "contact:mobile");
  const phone = cleanPhone(rawPhone, countryCode);

  const email = extractTag(t, "email", "contact:email");
  const website = extractTag(t, "website", "contact:website", "url");
  const brand = extractTag(t, "brand");
  const street = extractTag(t, "addr:street", "addr:full");
  const houseNo = t["addr:housenumber"];
  const address = [houseNo, street].filter(Boolean).join(" ") || undefined;

  return {
    id: `osm-${el.id}`,
    name,
    city: city.name,
    country: city.country,
    phone,
    whatsapp: phone, // In EA, business phone is almost always WhatsApp too
    email,
    website,
    address,
    brand: brand ? [brand] : undefined,
    rating: undefined, // OSM doesn't have ratings
    source: "openstreetmap",
  };
}

// ─── Dry run data ─────────────────────────────────────────────────────────────
const DRY_RUN_SAMPLE = [
  {
    id: "osm-sample-1",
    name: "Toyota Tanzania Ltd",
    city: "Dar es Salaam",
    country: "Tanzania",
    phone: "+255222863050",
    whatsapp: "+255222863050",
    email: "info@toyota.co.tz",
    website: "https://www.toyota.co.tz",
    address: "Pugu Road",
    brand: ["Toyota"],
    source: "openstreetmap",
  },
  {
    id: "osm-sample-2",
    name: "Toyota Kenya Ltd",
    city: "Nairobi",
    country: "Kenya",
    phone: "+254202695000",
    whatsapp: "+254202695000",
    email: "info@toyota.co.ke",
    website: "https://www.toyota.co.ke",
    address: "Enterprise Road",
    brand: ["Toyota"],
    source: "openstreetmap",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (DRY_RUN) {
    console.log("=== DRY RUN — no network calls ===\n");
    console.log(JSON.stringify(DRY_RUN_SAMPLE, null, 2));
    writeFileSync(OUTPUT_FILE, JSON.stringify(DRY_RUN_SAMPLE, null, 2));
    console.log(`\nWritten to ${OUTPUT_FILE}`);
    return;
  }

  const citiesToScrape = CITY_FILTER
    ? CITIES.filter((c) => c.name.toLowerCase() === CITY_FILTER.toLowerCase())
    : CITIES;

  if (citiesToScrape.length === 0) {
    console.error(`No city found matching "${CITY_FILTER}". Available: ${CITIES.map(c => c.name).join(", ")}`);
    process.exit(1);
  }

  const dealers = [];
  const seenIds = new Set();

  for (const city of citiesToScrape) {
    console.log(`\n🔍  Querying OSM for car dealers in ${city.name}, ${city.country}...`);

    const query = buildQuery(city.lat, city.lon);

    let data;
    let querySucceeded = false;
    for (const mirror of OVERPASS_MIRRORS) {
      try {
        console.log(`  Trying ${mirror.replace("https://", "").split("/")[0]}...`);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000); // 20s timeout
        const res = await fetch(mirror, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        data = await res.json();
        querySucceeded = true;
        break;
      } catch (err) {
        console.error(`  ⚠️  Mirror failed: ${err.message}`);
        await sleep(500);
      }
    }
    if (!querySucceeded) {
      console.error(`  ✗ All mirrors failed for ${city.name}, skipping.`);
      continue;
    }

    const elements = data.elements || [];
    console.log(`  Found ${elements.length} OSM elements`);

    let added = 0;
    for (const el of elements) {
      if (seenIds.has(el.id)) continue;
      seenIds.add(el.id);

      const dealer = osmElementToDealer(el, city, city.countryCode);
      if (!dealer) continue;

      dealers.push(dealer);
      added++;
      console.log(`  ✅  ${dealer.name}${dealer.phone ? " — " + dealer.phone : " — no phone"}`);
    }
    console.log(`  → Added ${added} dealers from ${city.name}`);

    // Be polite to the Overpass API — wait 1s between city queries
    if (citiesToScrape.indexOf(city) < citiesToScrape.length - 1) {
      await sleep(1000);
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(dealers, null, 2));
  console.log(`\n✨  Done! ${dealers.length} dealers written to ${OUTPUT_FILE}`);
  console.log(`\nNext step: copy the contents of ${OUTPUT_FILE} into src/data/dealers.ts`);
  console.log(`  (replace the DEALERS array with the scraped results)\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
