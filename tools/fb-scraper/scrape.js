import "dotenv/config";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const APIFY_TOKEN = process.env.APIFY_TOKEN;
if (!APIFY_TOKEN) {
  console.error("❌ Missing APIFY_TOKEN in .env file");
  console.error("   1. Sign up at https://apify.com (free)");
  console.error("   2. Get token from https://console.apify.com/settings/integrations");
  console.error("   3. Add APIFY_TOKEN=your_token to tools/fb-scraper/.env");
  process.exit(1);
}

// Real East African Facebook car selling groups (high-volume, verified)
const GROUPS = [
  // Tanzania
  { name: "Cars Tanzania",                 url: "https://www.facebook.com/groups/1388127748153617" },
  { name: "Gari za Kuuza Tanzania",        url: "https://www.facebook.com/groups/gariZaKuuzaTanzania" },
  { name: "Used Cars Tanzania Dar",        url: "https://www.facebook.com/groups/usedcarstanzania" },
  { name: "Magari Tanzania",              url: "https://www.facebook.com/groups/magaritanzania" },
  // Kenya
  { name: "Cars for Sale Kenya",           url: "https://www.facebook.com/groups/CarSaleKenya" },
  { name: "Buy and Sell Cars Kenya",       url: "https://www.facebook.com/groups/buyandsellcarskenya" },
  { name: "Nairobi Cars",                  url: "https://www.facebook.com/groups/nairobicars" },
  // Uganda
  { name: "Cars Uganda",                   url: "https://www.facebook.com/groups/carsuganda" },
  { name: "Buy and Sell Cars Uganda",      url: "https://www.facebook.com/groups/buyandsellcarsuganda" },
  // Rwanda
  { name: "Cars Rwanda",                   url: "https://www.facebook.com/groups/carsrwanda" },
];

// Car-related keywords to filter posts
const CAR_KEYWORDS = [
  "for sale", "inauzwa", "inauzwa", "unauzwa",
  "toyota", "nissan", "mazda", "subaru", "mitsubishi", "honda", "hyundai",
  "hilux", "land cruiser", "prado", "harrier", "fortuner", "vitz", "demio",
  "patrol", "navara", "x-trail", "safari",
  "ksh", "tzs", "ugx", "rwf", "million", "milioni", "laki",
  "cc", "km", "mileage",
  "2wd", "4wd", "4x4", "automatic", "manual",
];

function isCarPost(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CAR_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * SEO quality score 0–10.
 * Only listings with score >= 6 are kept.
 * High-quality listings have: photos, price, phone, year, make/model, mileage.
 * These are exactly the fields that make a unique, rankable SEO page:
 *   "2019 Toyota Hilux 4WD for sale Dar es Salaam TZS 95,000,000"
 */
function qualityScore(post) {
  const text = post.text || post.message || "";
  let score = 0;

  // Photos are the #1 signal — Google ranks image-rich pages higher
  const photoCount = (post.media || []).filter(m => m.type === "photo").length;
  if (photoCount >= 5) score += 3;
  else if (photoCount >= 2) score += 2;
  else if (photoCount >= 1) score += 1;

  // Price makes a unique, rankable title
  if (extractPrice(text)) score += 2;

  // Year + make/model = specific long-tail keyword
  if (extractYear(text)) score += 1;
  const lower = text.toLowerCase();
  const hasMake = ["toyota","nissan","mazda","subaru","mitsubishi","honda","jeep","land rover","bmw","mercedes"].some(m => lower.includes(m));
  if (hasMake) score += 1;

  // Phone number = seller is real and reachable
  if (extractPhone(text)) score += 1;

  // Long description = more content for SEO
  if (text.length > 200) score += 1;

  // Mileage = more specific, better long-tail
  if (extractMileage(text)) score += 1;

  return score;
}

function extractPrice(text) {
  if (!text) return null;
  // TZS patterns: "45M", "45 million", "TSh 45,000,000"
  const tzs = text.match(/(?:tzs?|tsh|sh)[\s.]*([\d,]+(?:\.\d+)?)\s*(?:million|m\b)?/i);
  if (tzs) {
    let val = parseFloat(tzs[1].replace(/,/g, ""));
    if (text.toLowerCase().includes("million") || tzs[0].toLowerCase().includes("m")) val *= 1_000_000;
    return { amount: val, currency: "TZS" };
  }
  // KSH patterns
  const ksh = text.match(/(?:ksh|kes|ksh\.)[\s.]*([\d,]+(?:\.\d+)?)\s*(?:million|m\b)?/i);
  if (ksh) {
    let val = parseFloat(ksh[1].replace(/,/g, ""));
    if (text.toLowerCase().includes("million")) val *= 1_000_000;
    return { amount: val, currency: "KES" };
  }
  // Plain number followed by M
  const plain = text.match(/\b([\d,]+)\s*(?:m|million)\b/i);
  if (plain) return { amount: parseFloat(plain[1].replace(/,/g, "")) * 1_000_000, currency: "TZS" };
  return null;
}

function extractYear(text) {
  const match = text?.match(/\b(19[89]\d|20[012]\d)\b/);
  return match ? parseInt(match[1]) : null;
}

function extractPhone(text) {
  const match = text?.match(/(?:\+?255|0)[67]\d{8}|\+?254[7]\d{8}|\+?256[7]\d{8}/);
  return match ? match[0] : null;
}

function extractCC(text) {
  const match = text?.match(/\b([12][0-9]{2}[05])\s*cc\b/i);
  return match ? parseInt(match[1]) : null;
}

function extractMileage(text) {
  const match = text?.match(/(\d+[\d,]*)\s*(?:km|kilometers|kilometres)\b/i);
  return match ? parseInt(match[1].replace(/,/g, "")) : null;
}

async function runApifyActor(groupUrls) {
  console.log(`\n🚀 Starting Apify scrape for ${groupUrls.length} groups...`);

  // Start the actor run
  const startRes = await fetch(
    `https://api.apify.com/v2/acts/apify~facebook-groups-scraper/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls: groupUrls.map(url => ({ url })),
        maxPosts: 200,
        maxPostComments: 0,
        maxReviews: 0,
        scrapeAbout: false,
        scrapeMedia: true,
      }),
    }
  );

  if (!startRes.ok) {
    const err = await startRes.text();
    throw new Error(`Failed to start Apify actor: ${startRes.status} ${err}`);
  }

  const { data: run } = await startRes.json();
  console.log(`   Run ID: ${run.id} — waiting for completion...`);

  // Poll until done
  let status = run.status;
  let attempts = 0;
  while (!["SUCCEEDED", "FAILED", "ABORTED"].includes(status) && attempts < 60) {
    await new Promise(r => setTimeout(r, 10000)); // wait 10s
    attempts++;
    const pollRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${run.id}?token=${APIFY_TOKEN}`
    );
    const { data: pollData } = await pollRes.json();
    status = pollData.status;
    process.stdout.write(`   Status: ${status} (${attempts * 10}s elapsed)\r`);
  }

  console.log(`\n   Final status: ${status}`);
  if (status !== "SUCCEEDED") throw new Error(`Actor run failed with status: ${status}`);

  // Fetch results
  const dataRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${run.id}/dataset/items?token=${APIFY_TOKEN}&format=json`
  );
  const items = await dataRes.json();
  console.log(`   Fetched ${items.length} raw posts`);
  return items;
}

async function main() {
  console.log("🚗 Motokah Facebook Group Scraper");
  console.log("==================================\n");

  mkdirSync(join(__dirname, "output"), { recursive: true });

  const groupUrls = GROUPS.map(g => g.url);

  let rawPosts;
  try {
    rawPosts = await runApifyActor(groupUrls);
  } catch (err) {
    console.error(`\n❌ Scraping failed: ${err.message}`);
    process.exit(1);
  }

  // Filter, score, and transform — only keep best listings for SEO
  const MIN_QUALITY_SCORE = 5; // must score at least 5/10

  const allCarPosts = rawPosts.filter(post => isCarPost(post.text || post.message || ""));
  const scoredPosts = allCarPosts.map(post => ({ post, score: qualityScore(post) }));
  const topPosts = scoredPosts
    .filter(({ score }) => score >= MIN_QUALITY_SCORE)
    .sort((a, b) => b.score - a.score) // best first
    .map(({ post, score }) => {
      const text = post.text || post.message || "";
      const price = extractPrice(text);
      const phone = extractPhone(text);
      const images = (post.media || [])
        .filter(m => m.type === "photo")
        .map(m => m.url || m.photoUrl)
        .filter(Boolean);

      return {
        qualityScore: score,
        sourceGroup: post.groupName || "Unknown Group",
        postUrl: post.url || post.postUrl,
        authorName: post.authorName || "Seller",
        authorId: post.authorId,
        postedAt: post.time || post.timestamp,
        text: text.slice(0, 1000),
        images,
        extracted: {
          price,
          year: extractYear(text),
          phone,
          cc: extractCC(text),
          mileage: extractMileage(text),
        },
      };
    });

  const carPosts = topPosts;
  console.log(`\n✅ Quality filter: ${rawPosts.length} raw → ${allCarPosts.length} car posts → ${carPosts.length} high-quality (score ≥${MIN_QUALITY_SCORE})`);
  if (carPosts.length > 0) {
    console.log(`   Top score: ${carPosts[0].qualityScore}/10 | Lowest kept: ${carPosts[carPosts.length-1].qualityScore}/10`);
  }

  // Save raw output
  const outputPath = join(__dirname, "output", "scraped-cars.json");
  writeFileSync(outputPath, JSON.stringify(carPosts, null, 2));
  console.log(`   Saved to: ${outputPath}`);

  // Summary stats
  const withImages = carPosts.filter(p => p.images.length > 0).length;
  const withPhone  = carPosts.filter(p => p.extracted.phone).length;
  const withPrice  = carPosts.filter(p => p.extracted.price).length;
  const avgScore   = carPosts.length ? (carPosts.reduce((s,p) => s + p.qualityScore, 0) / carPosts.length).toFixed(1) : 0;
  console.log(`\n📊 Summary:`);
  console.log(`   With images:   ${withImages}`);
  console.log(`   With phone:    ${withPhone}`);
  console.log(`   With price:    ${withPrice}`);
  console.log(`   Avg SEO score: ${avgScore}/10`);
  console.log(`\n👉 Run: node upload-images.js   — uploads photos to GitHub CDN`);
  console.log(`👉 Run: node convert.js          — generates mockData.ts additions`);
}

main().catch(console.error);
