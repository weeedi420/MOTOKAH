/**
 * Robust bulk import for scraped CSV with broken quotes
 * Usage: node scripts/import-bulk-safe.cjs [path/to/file.csv]
 */

try { require("dotenv").config(); } catch {}

const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const BATCH_SIZE = 100;
const CSV_PATH = process.argv[2] || "C:\\Users\\rapid\\Downloads\\motokah_2026-05-09 (1).csv";

// ── ROBUST CSV PARSER ─────────────────────────────────────────
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;
  let lineIdx = 1;

  for (let i = lineIdx; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          j++; // skip escaped quote
        } else if (inQuotes) {
          inQuotes = false;
        } else {
          inQuotes = true;
        }
      } else if (char === "," && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = "";
      } else {
        currentField += char;
      }
    }

    if (inQuotes) {
      // Field continues on next line — append newline and continue
      currentField += "\n";
      continue;
    }

    // End of row
    currentRow.push(currentField.trim());

    if (currentRow.length === headers.length) {
      const obj = {};
      headers.forEach((h, idx) => {
        let val = currentRow[idx] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        obj[h] = val;
      });
      rows.push(obj);
    } else if (currentRow.length > 1) {
      // Try to salvage — pad missing fields
      const obj = {};
      headers.forEach((h, idx) => {
        let val = currentRow[idx] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        obj[h] = val;
      });
      rows.push(obj);
    }

    currentRow = [];
    currentField = "";
    inQuotes = false;
  }

  return rows;
}

// ── Helpers ───────────────────────────────────────────────────
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  return colors.find((c) => title.toLowerCase().includes(c.toLowerCase())) || null;
}

function parsePrice(priceText) {
  if (!priceText) return 0;
  const cleaned = priceText.replace(/[^0-9]/g, "");
  return parseFloat(cleaned) || 0;
}

function parseYear(title) {
  const match = title.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[1]) : 2000;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("❌ CSV not found:", CSV_PATH);
    process.exit(1);
  }

  const text = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCSV(text);
  console.log(`📦 Total rows parsed: ${rows.length}`);

  // Validate first few rows
  console.log("\n📋 Sample rows:");
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const r = rows[i];
    console.log(`  ${i + 1}. ${r.title?.substring(0, 50)} | ${r.make} | ${r.year} | ${r.price}`);
  }

  // Get scraper user
  const scraperEmail = "scraper@motokah.internal";
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === scraperEmail);
  let scraperUserId;

  if (existing) {
    scraperUserId = existing.id;
  } else {
    const { data: newUser } = await supabase.auth.admin.createUser({
      email: scraperEmail,
      password: require("crypto").randomUUID(),
      email_confirm: true,
      user_metadata: { display_name: "Scraper Bot" },
    });
    scraperUserId = newUser.user.id;
  }

  // Ensure profile
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

  // Build existing set
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
  let invalid = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const listingsToInsert = [];
    const imagesToInsert = [];

    for (const row of batch) {
      // Validate required fields
      if (!row.title || !row.make || !row.imageUrl) {
        invalid++;
        continue;
      }

      const price = parsePrice(row.priceText) || parseFloat(row.price) || 0;
      if (price <= 0) {
        invalid++;
        continue;
      }

      const year = parseInt(row.year) || parseYear(row.title);
      const make = row.make || "Unknown";
      const model = row.model || extractModel(row.title, make, year);
      const city = row.location?.split(",")[0]?.trim() || "Dar es Salaam";
      const currency = row.currency || "TZS";

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
        mileage: row.mileage ? parseInt(row.mileage) : null,
        transmission: row.transmission || null,
        fuel_type: row.fuel_type || null,
        body_type: row.body_type || null,
        color: extractColor(row.title),
        condition: row.condition || "Used",
        description: row.description || `${row.title}. Contact for more details.`,
        city,
        status: "approved",
        views: 0,
      });

      if (row.imageUrl) {
        imagesToInsert.push({ image_url: row.imageUrl, display_order: 0 });
      }
    }

    if (listingsToInsert.length === 0) continue;

    const { data: insertedListings, error: listingsErr } = await supabase
      .from("listings")
      .insert(listingsToInsert)
      .select("id");

    if (listingsErr) {
      console.error(`❌ Batch ${i}-${i + BATCH_SIZE} failed:`, listingsErr.message);
      failed += listingsToInsert.length;
      continue;
    }

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
      await supabase.from("listing_images").insert(imagesBatch);
    }

    inserted += listingsToInsert.length;
    process.stdout.write(`\r✅ Inserted ${inserted}/${rows.length} (skipped ${skipped}, invalid ${invalid}, failed ${failed})`);

    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("\n\n🎉 Done!");
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped (duplicates): ${skipped}`);
  console.log(`   Invalid: ${invalid}`);
  console.log(`   Failed: ${failed}`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
