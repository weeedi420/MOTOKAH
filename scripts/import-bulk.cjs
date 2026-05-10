/**
 * Bulk import scraped CSV cars into Supabase
 * Usage: node scripts/import-bulk.cjs [path/to/file.csv]
 */

try { require("dotenv").config(); } catch {}

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Config ───────────────────────────────────────────────────
const BATCH_SIZE = 50; // Insert 50 listings at a time
const CSV_PATH = process.argv[2] || "C:\\Users\\rapid\\Downloads\\motokah_2026-05-09 (1).csv";

// ── Parse CSV ─────────────────────────────────────────────────
function parseCSV(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const obj = {};
    headers.forEach((h, idx) => {
      let val = values[idx] || "";
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      obj[h] = val;
    });
    rows.push(obj);
  }
  return rows;
}

// ── Extract model from title ──────────────────────────────────
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractModel(title, make, year) {
  let model = title
    .replace(new RegExp(escapeRegExp(make), "i"), "")
    .replace(new RegExp(escapeRegExp(String(year))), "")
    .replace(/\b(Used|New|Certified|Pre-owned|Brand New)\b/gi, "")
    .replace(/\b(White|Black|Silver|Gray|Grey|Red|Blue|Green|Gold|Beige|Brown|Yellow|Orange|Purple|Maroon|Bronze|Copper|Ivory|Cream|Sand|Burgundy|Champagne|Tan|Charcoal|Pearl)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return model || "Unknown";
}

function extractColor(title) {
  const colors = ["White","Black","Silver","Gray","Grey","Red","Blue","Green","Gold","Beige","Brown","Yellow","Orange","Purple","Maroon","Bronze","Copper","Ivory","Cream","Sand","Burgundy","Champagne","Tan","Charcoal","Pearl"];
  const match = colors.find((c) => title.toLowerCase().includes(c.toLowerCase()));
  return match || null;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("❌ CSV not found:", CSV_PATH);
    process.exit(1);
  }

  const rows = parseCSV(CSV_PATH);
  console.log(`📦 Total rows in CSV: ${rows.length}`);

  // Get or create scraper user
  const scraperEmail = "scraper@motokah.internal";
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === scraperEmail);
  let scraperUserId;

  if (existing) {
    scraperUserId = existing.id;
    console.log("✅ Using existing scraper user:", scraperUserId);
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: scraperEmail,
      password: require("crypto").randomUUID(),
      email_confirm: true,
      user_metadata: { display_name: "Scraper Bot" },
    });
    if (createErr) {
      console.error("❌ Failed to create scraper user:", createErr.message);
      process.exit(1);
    }
    scraperUserId = newUser.user.id;
    console.log("✅ Created scraper user:", scraperUserId);
  }

  // Ensure profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", scraperUserId)
    .single();

  if (!existingProfile) {
    await supabase.from("profiles").insert({
      user_id: scraperUserId,
      display_name: "Scraper Bot",
      seller_type: "private",
    });
  }

  // Check existing listings to avoid duplicates
  const { data: existingListings } = await supabase
    .from("listings")
    .select("title, city, price, year")
    .eq("seller_id", scraperUserId);

  const existingSet = new Set(
    (existingListings || []).map((l) => `${l.title}|${l.city}|${l.price}|${l.year}`)
  );

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const listingsToInsert = [];
    const imagesToInsert = [];

    for (const row of batch) {
      const make = row.make || "Unknown";
      const model = row.model || extractModel(row.title, make, row.year);
      const year = parseInt(row.year) || 2000;
      const price = parseFloat(row.price) || 0;
      const currency = row.currency || "TZS";
      const mileage = row.mileage ? parseInt(row.mileage) : null;
      const transmission = row.transmission || null;
      const fuelType = row.fuel_type || null;
      const bodyType = row.body_type || null;
      const condition = row.condition || "Used";
      const color = extractColor(row.title);
      const city = row.location?.split(",")[0]?.trim() || "Dar es Salaam";
      const description = row.description || `${row.title}. Contact for more details.`;
      const imageUrl = row.imageUrl || null;

      const key = `${row.title}|${city}|${price}|${year}`;
      if (existingSet.has(key)) {
        skipped++;
        continue;
      }
      existingSet.add(key);

      listingsToInsert.push({
        seller_id: scraperUserId,
        title: row.title,
        make,
        model,
        year,
        price,
        currency,
        mileage,
        transmission,
        fuel_type: fuelType,
        body_type: bodyType,
        color,
        condition,
        description,
        city,
        status: "approved",
        views: 0,
      });

      if (imageUrl) {
        imagesToInsert.push({ image_url: imageUrl, display_order: 0 });
      }
    }

    if (listingsToInsert.length === 0) continue;

    // Insert listings
    const { data: insertedListings, error: listingsErr } = await supabase
      .from("listings")
      .insert(listingsToInsert)
      .select("id");

    if (listingsErr) {
      console.error(`❌ Batch ${i}-${i + BATCH_SIZE} failed:`, listingsErr.message);
      failed += listingsToInsert.length;
      continue;
    }

    // Insert images
    const imagesBatch = [];
    for (let j = 0; j < insertedListings.length; j++) {
      if (imagesToInsert[j]) {
        imagesBatch.push({
          listing_id: insertedListings[j].id,
          image_url: imagesToInsert[j].image_url,
          display_order: imagesToInsert[j].display_order,
        });
      }
    }

    if (imagesBatch.length > 0) {
      const { error: imgErr } = await supabase.from("listing_images").insert(imagesBatch);
      if (imgErr) {
        console.error(`⚠️ Images batch ${i} failed:`, imgErr.message);
      }
    }

    inserted += listingsToInsert.length;
    console.log(`✅ Inserted ${inserted}/${rows.length} (skipped ${skipped}, failed ${failed})`);

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\n🎉 Done!");
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped (duplicates): ${skipped}`);
  console.log(`   Failed: ${failed}`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
