/**
 * Downloads scraped car images and commits them to the car-images/ folder
 * in weeedi420/remix-of-afriwheels-hub via the GitHub API.
 * Served as: https://raw.githubusercontent.com/weeedi420/remix-of-afriwheels-hub/main/car-images/
 * No separate repo needed. No laptop storage used.
 */
import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO  = process.env.GITHUB_REPO  || "weeedi420/remix-of-afriwheels-hub";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const IMAGE_FOLDER  = process.env.IMAGE_FOLDER  || "car-images";

const CDN_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${IMAGE_FOLDER}`;
const API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents/${IMAGE_FOLDER}`;

if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN missing in .env"); process.exit(1);
}

async function getFileSha(filename) {
  const res = await fetch(`${API_BASE}/${filename}`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json" }
  });
  if (res.status === 404) return null;
  const data = await res.json();
  return data.sha || null;
}

async function uploadToGitHub(imageUrl, filename) {
  let imgBuffer;
  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "Motokah-Scraper/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    imgBuffer = Buffer.from(await res.arrayBuffer());
  } catch (e) {
    return { ok: false, reason: `download failed: ${e.message}` };
  }

  // Check if file already exists (get SHA for update)
  const existingSha = await getFileSha(filename);

  const body = {
    message: `Add car image: ${filename}`,
    content: imgBuffer.toString("base64"),
    branch: GITHUB_BRANCH,
  };
  if (existingSha) body.sha = existingSha; // update existing file

  const res = await fetch(`${API_BASE}/${filename}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return { ok: false, reason: `GitHub API ${res.status}: ${err.slice(0, 120)}` };
  }

  return { ok: true, url: `${CDN_BASE}/${filename}` };
}

async function main() {
  const inputPath = join(__dirname, "output", "scraped-cars.json");
  const listings = JSON.parse(readFileSync(inputPath, "utf8"));

  console.log(`🖼  Uploading images for ${listings.length} listings`);
  console.log(`   → github.com/${GITHUB_REPO}/tree/${GITHUB_BRANCH}/${IMAGE_FOLDER}/`);
  console.log(`   → CDN: ${CDN_BASE}/\n`);

  let uploaded = 0, skipped = 0, failed = 0;

  for (let i = 0; i < listings.length; i++) {
    const listing = listings[i];
    if (!listing.images?.length) { skipped++; continue; }

    const newImages = [];
    for (let j = 0; j < listing.images.length; j++) {
      const rawUrl = listing.images[j];
      const ext = rawUrl.split("?")[0].split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const filename = `listing-${String(i + 100).padStart(5, "0")}-img${String(j + 1).padStart(3, "0")}.${ext.slice(0,4)}`;
      process.stdout.write(`  [${i + 1}/${listings.length}] ${filename} `);

      const result = await uploadToGitHub(rawUrl, filename);
      if (result.ok) {
        newImages.push(result.url);
        uploaded++;
        process.stdout.write("✓\n");
      } else {
        failed++;
        process.stdout.write(`✗ ${result.reason}\n`);
      }

      // Stay well within GitHub's 5000 requests/hour rate limit
      await new Promise(r => setTimeout(r, 300));
    }

    listing.images = newImages;
    if (newImages[0]) listing.image = newImages[0];
  }

  writeFileSync(inputPath, JSON.stringify(listings, null, 2));

  console.log(`\n✅ Done: ${uploaded} uploaded, ${failed} failed, ${skipped} listings had no images`);
  console.log(`   scraped-cars.json updated with CDN URLs`);
  console.log(`\n👉 Now run: node convert.js`);
}

main().catch(console.error);
