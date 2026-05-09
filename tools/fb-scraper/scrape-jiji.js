/**
 * Jiji.co.tz scraper — Tanzania's largest public car classifieds
 * No login needed. No ban risk. Rich structured data + real photos.
 *
 * Run: node scrape-jiji.js
 * Output: output/jiji-cars.json
 */
import "dotenv/config";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(__dirname, "output"), { recursive: true });

const BASE = "https://jiji.co.tz";

// Category URLs — each page has ~45 listings
const CATEGORY_URLS = [
  "/cars?page=1", "/cars?page=2", "/cars?page=3", "/cars?page=4", "/cars?page=5",
  "/cars/toyota?page=1", "/cars/toyota?page=2",
  "/cars/nissan?page=1", "/cars/nissan?page=2",
  "/cars/subaru?page=1",
  "/cars/mazda?page=1",
  "/cars/mitsubishi?page=1",
  "/cars/land-rover?page=1",
];

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

async function fetchPage(url) {
  const res = await fetch(`${BASE}${url}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function extractJsonLd(html) {
  const matches = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  const results = [];
  for (const m of matches) {
    try { results.push(JSON.parse(m[1])); } catch {}
  }
  return results;
}

function extractApiData(html) {
  // Jiji embeds listing data as __NEXT_DATA__ or window.__JIJI_DATA__
  const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (nextData) {
    try { return JSON.parse(nextData[1]); } catch {}
  }
  return null;
}

function parseListingsFromHtml(html, sourceUrl) {
  const listings = [];

  // Try structured __NEXT_DATA__ first
  const nextData = extractApiData(html);
  if (nextData) {
    const ads = nextData?.props?.pageProps?.ads ||
                nextData?.props?.pageProps?.items ||
                [];
    for (const ad of ads) {
      const listing = parseAdObject(ad, sourceUrl);
      if (listing) listings.push(listing);
    }
    if (listings.length > 0) return listings;
  }

  // Fallback: parse JSON-LD Product items
  const jsonLds = extractJsonLd(html);
  for (const ld of jsonLds) {
    const items = Array.isArray(ld) ? ld : [ld];
    for (const item of items) {
      if (item["@type"] === "Product" || item["@type"] === "Car") {
        const listing = {
          title: item.name || "",
          price: item.offers?.price || 0,
          currency: item.offers?.priceCurrency || "TZS",
          images: [item.image].flat().filter(Boolean),
          description: item.description || "",
          url: item.url || "",
          location: "Tanzania",
        };
        if (listing.title) listings.push(listing);
      }
    }
  }

  return listings;
}

function parseAdObject(ad, sourceUrl) {
  if (!ad) return null;
  const title = ad.title || ad.name || "";
  if (!title) return null;

  const images = [];
  for (const img of (ad.images || ad.photos || [])) {
    const url = img.url || img.src || img.original_image_url || img;
    if (typeof url === "string" && url.startsWith("http")) images.push(url);
  }

  const price = ad.price_obj?.value || ad.price || ad.price_value || 0;
  const currency = ad.price_obj?.currency_code || ad.currency || "TZS";

  return {
    id: ad.id || ad.slug,
    title,
    price: typeof price === "string" ? parseInt(price.replace(/\D/g,"")) || 0 : price,
    currency,
    images,
    image: images[0] || null,
    description: (ad.description || ad.body || "").slice(0, 800),
    location: ad.region_name || ad.city || ad.location || "Tanzania",
    sellerName: ad.user?.name || ad.seller_name || "Seller",
    sellerPhone: ad.user?.phone || ad.phone || null,
    year: parseInt(ad.attrs?.find?.(a => a.name === "Year" || a.slug === "year")?.value) || extractYear(title),
    mileage: parseInt(ad.attrs?.find?.(a => a.slug === "mileage")?.value?.replace?.(/\D/g,"")) || 0,
    transmission: ad.attrs?.find?.(a => a.slug === "transmission")?.value || "Automatic",
    condition: ad.attrs?.find?.(a => a.slug === "condition")?.value || "Foreign Used",
    url: ad.url ? `${BASE}${ad.url}` : (ad.canonical_url || ""),
    sourceUrl,
  };
}

function extractYear(text) {
  const m = text?.match(/\b(19[89]\d|20[012]\d)\b/);
  return m ? parseInt(m[1]) : null;
}

function qualityScore(listing) {
  let score = 0;
  if (listing.images.length >= 5) score += 3;
  else if (listing.images.length >= 2) score += 2;
  else if (listing.images.length >= 1) score += 1;
  if (listing.price > 0) score += 2;
  if (listing.year) score += 1;
  if (listing.sellerPhone) score += 1;
  if (listing.description.length > 100) score += 1;
  if (listing.mileage > 0) score += 1;
  if (listing.location && listing.location !== "Tanzania") score += 1;
  return score;
}

async function main() {
  console.log("🚗 Motokah — Jiji.co.tz Scraper");
  console.log("=================================\n");

  const allListings = [];
  let pageErrors = 0;

  for (let i = 0; i < CATEGORY_URLS.length; i++) {
    const url = CATEGORY_URLS[i];
    process.stdout.write(`[${i+1}/${CATEGORY_URLS.length}] ${url} `);

    try {
      const html = await fetchPage(url);
      const listings = parseListingsFromHtml(html, `${BASE}${url}`);
      allListings.push(...listings);
      process.stdout.write(`→ ${listings.length} listings\n`);
    } catch (e) {
      process.stdout.write(`→ ERROR: ${e.message}\n`);
      pageErrors++;
    }

    // Polite delay between requests
    await new Promise(r => setTimeout(r, 1500));
  }

  // Deduplicate by id/title
  const seen = new Set();
  const unique = allListings.filter(l => {
    const key = l.id || l.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Score and filter
  const MIN_SCORE = 4;
  const scored = unique
    .map(l => ({ ...l, qualityScore: qualityScore(l) }))
    .filter(l => l.qualityScore >= MIN_SCORE)
    .sort((a, b) => b.qualityScore - a.qualityScore);

  console.log(`\n📊 Results:`);
  console.log(`   Total scraped:    ${allListings.length}`);
  console.log(`   Unique:           ${unique.length}`);
  console.log(`   Quality (≥${MIN_SCORE}/10): ${scored.length}`);
  console.log(`   With images:      ${scored.filter(l => l.images.length > 0).length}`);
  console.log(`   With price:       ${scored.filter(l => l.price > 0).length}`);
  console.log(`   Page errors:      ${pageErrors}`);

  const outputPath = join(__dirname, "output", "jiji-cars.json");
  writeFileSync(outputPath, JSON.stringify(scored, null, 2));
  console.log(`\n✅ Saved ${scored.length} listings → ${outputPath}`);
  console.log(`\n👉 Next: node convert-jiji.js  → generates mockData.ts additions`);
}

main().catch(console.error);
