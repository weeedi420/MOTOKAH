#!/usr/bin/env node
/**
 * Motokah — East Africa Car Dealer Scraper
 *
 * Uses the Google Places API (Text Search + Place Details) to discover
 * car dealers/showrooms across East Africa and outputs a JSON file.
 *
 * HOW TO GET A GOOGLE API KEY:
 *   1. Go to https://console.cloud.google.com/
 *   2. Create a project (or select an existing one)
 *   3. Enable "Places API" from the API Library
 *   4. Go to Credentials → Create Credentials → API Key
 *   5. (Recommended) Restrict the key to "Places API" only
 *
 * USAGE:
 *   GOOGLE_API_KEY=your_key node scripts/scrape-dealers.js
 *   GOOGLE_API_KEY=your_key node scripts/scrape-dealers.js --dry-run
 *
 * OUTPUT:
 *   scripts/dealers-output.json
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Config ───────────────────────────────────────────────────────────────────

const API_KEY = process.env.GOOGLE_API_KEY;
const DRY_RUN = process.argv.includes("--dry-run");
const OUTPUT_FILE = join(__dirname, "dealers-output.json");

/** Cities to search, each with a country code for phone cleaning */
const CITIES = [
  { name: "Dar es Salaam", country: "Tanzania", countryCode: "255" },
  { name: "Arusha",        country: "Tanzania", countryCode: "255" },
  { name: "Mwanza",        country: "Tanzania", countryCode: "255" },
  { name: "Zanzibar",      country: "Tanzania", countryCode: "255" },
  { name: "Nairobi",       country: "Kenya",    countryCode: "254" },
  { name: "Mombasa",       country: "Kenya",    countryCode: "254" },
  { name: "Kisumu",        country: "Kenya",    countryCode: "254" },
  { name: "Kampala",       country: "Uganda",   countryCode: "256" },
  { name: "Kigali",        country: "Rwanda",   countryCode: "250" },
  { name: "Addis Ababa",   country: "Ethiopia", countryCode: "251" },
];

/** Search queries to run per city */
const QUERIES = ["car showroom", "car dealer", "motor dealer"];

// ─── Phone cleaning ────────────────────────────────────────────────────────────

/**
 * Clean a raw phone string to international format.
 * - Strips all non-digits except a leading +
 * - Converts African 0xxx local numbers to +countryCode format
 * - Ensures African country codes have + prefix
 */
function cleanPhone(raw, defaultCountryCode) {
  if (!raw) return undefined;

  // Keep only digits and a leading +
  let digits = raw.replace(/[^\d+]/g, "");

  // Remove + for processing, we'll add it back
  const hasPlus = digits.startsWith("+");
  if (hasPlus) digits = digits.slice(1);

  const AFRICAN_CODES = ["255", "254", "256", "250", "251"];

  // Local 0xxx → strip leading 0, prepend default country code
  if (digits.startsWith("0") && digits.length <= 10) {
    digits = defaultCountryCode + digits.slice(1);
  }

  // Ensure African country codes have + prefix
  for (const code of AFRICAN_CODES) {
    if (digits.startsWith(code)) {
      return "+" + digits;
    }
  }

  // If we had a + originally or it looks like an intl number, keep it
  if (hasPlus || digits.length >= 10) {
    return "+" + digits;
  }

  return "+" + digits;
}

// ─── Google Places API helpers ────────────────────────────────────────────────

const PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

/** Text Search: returns an array of place_id strings */
async function textSearch(query, city) {
  const q = encodeURIComponent(`${query} in ${city}`);
  const url = `${PLACES_BASE}/textsearch/json?query=${q}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Text search failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Places API error: ${data.status} — ${data.error_message || ""}`);
  }
  return (data.results || []).map((r) => r.place_id);
}

/** Place Details: returns structured dealer info for one place_id */
async function placeDetails(placeId) {
  const fields = "name,formatted_phone_number,website,rating,formatted_address";
  const url = `${PLACES_BASE}/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Place details failed: ${res.status}`);
  const data = await res.json();
  if (data.status !== "OK") return null;
  return data.result;
}

/** Sleep helper to avoid rate-limiting */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Dry-run seed data ────────────────────────────────────────────────────────

const DRY_RUN_DATA = [
  {
    id: "dry-1",
    name: "Toyota Tanzania Ltd",
    city: "Dar es Salaam",
    country: "Tanzania",
    phone: "+255222863050",
    whatsapp: "+255222863050",
    email: "info@toyota.co.tz",
    website: "https://www.toyota.co.tz",
    address: "Pugu Road, Dar es Salaam",
    rating: 4.5,
    source: "google_places",
  },
  {
    id: "dry-2",
    name: "Toyota Kenya Ltd",
    city: "Nairobi",
    country: "Kenya",
    phone: "+254202695000",
    whatsapp: "+254202695000",
    email: "info@toyota.co.ke",
    website: "https://www.toyota.co.ke",
    address: "Enterprise Road, Industrial Area, Nairobi",
    rating: 4.4,
    source: "google_places",
  },
  {
    id: "dry-3",
    name: "Toyota Uganda Ltd",
    city: "Kampala",
    country: "Uganda",
    phone: "+256312200700",
    whatsapp: "+256312200700",
    email: "info@toyota.co.ug",
    website: "https://www.toyota.co.ug",
    address: "Jinja Road, Kampala",
    rating: 4.3,
    source: "google_places",
  },
];

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) {
    console.log("=== DRY RUN — printing seed data, no API calls ===\n");
    console.log(JSON.stringify(DRY_RUN_DATA, null, 2));
    writeFileSync(OUTPUT_FILE, JSON.stringify(DRY_RUN_DATA, null, 2));
    console.log(`\nWritten to ${OUTPUT_FILE}`);
    return;
  }

  if (!API_KEY) {
    console.error(
      "Error: GOOGLE_API_KEY env variable is required.\n" +
      "Get one at https://console.cloud.google.com/ and enable the Places API."
    );
    process.exit(1);
  }

  const dealers = [];
  const seenIds = new Set();
  let idCounter = 1;

  for (const city of CITIES) {
    for (const query of QUERIES) {
      console.log(`🔍  Searching "${query}" in ${city.name}...`);

      let placeIds;
      try {
        placeIds = await textSearch(query, city.name);
      } catch (err) {
        console.error(`  ⚠️  Text search failed for "${query}" in ${city.name}: ${err.message}`);
        continue;
      }

      console.log(`  Found ${placeIds.length} results`);

      for (const placeId of placeIds) {
        if (seenIds.has(placeId)) continue;
        seenIds.add(placeId);

        await sleep(200); // gentle rate limiting

        let detail;
        try {
          detail = await placeDetails(placeId);
        } catch (err) {
          console.error(`  ⚠️  Place details failed for ${placeId}: ${err.message}`);
          continue;
        }
        if (!detail) continue;

        const rawPhone = detail.formatted_phone_number;
        const cleanedPhone = cleanPhone(rawPhone, city.countryCode);

        const dealer = {
          id: `gp-${String(idCounter++).padStart(4, "0")}`,
          name: detail.name || "Unknown",
          city: city.name,
          country: city.country,
          phone: cleanedPhone,
          whatsapp: cleanedPhone,
          email: undefined, // Places API does not return emails
          website: detail.website || undefined,
          address: detail.formatted_address || undefined,
          rating: detail.rating || undefined,
          source: "google_places",
        };

        dealers.push(dealer);
        console.log(`  ✅  ${dealer.name} — ${dealer.phone || "no phone"}`);
      }
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(dealers, null, 2));
  console.log(`\n✨  Done! ${dealers.length} dealers written to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
