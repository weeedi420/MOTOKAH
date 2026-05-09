/**
 * Import ONE scraped car from CSV into Supabase for testing
 * Usage: node scripts/import-one-car.cjs
 */

try { require("dotenv").config(); } catch {}

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  console.error("   You can find the service role key in Supabase Dashboard → Project Settings → API");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
function extractModel(title, make, year) {
  // Remove make and year from title to get model
  let model = title
    .replace(new RegExp(make, "i"), "")
    .replace(new RegExp(year), "")
    .replace(/\b(Used|New|Certified|Pre-owned|Brand New)\b/gi, "")
    .replace(/\b(White|Black|Silver|Gray|Grey|Red|Blue|Green|Gold|Beige|Brown|Yellow|Orange|Purple|Maroon|Bronze|Copper|Ivory|Cream|Sand|Burgundy|Champagne|Tan|Charcoal|Pearl)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return model || "Unknown";
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const csvPath = process.argv[2] || "C:\\Users\\rapid\\Downloads\\motokah_2026-05-09 (1).csv";
  if (!fs.existsSync(csvPath)) {
    console.error("❌ CSV not found:", csvPath);
    process.exit(1);
  }

  const rows = parseCSV(csvPath);
  if (rows.length === 0) {
    console.error("❌ No rows in CSV");
    process.exit(1);
  }

  // Pick a good row (skip first Land Rover with empty model, pick Honda CR-V)
  const row = rows[1]; // Honda CR-V 2008 Gray
  console.log("📦 Importing:", row.title);

  // Create or get scraper user
  const scraperEmail = "scraper@motokah.internal";
  let scraperUserId;

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === scraperEmail);

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
    console.log("✅ Created profile for scraper user");
  }

  // Parse fields
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
  const color = (() => {
    const colors = ["White","Black","Silver","Gray","Grey","Red","Blue","Green","Gold","Beige","Brown","Yellow","Orange","Purple","Maroon","Bronze","Copper","Ivory","Cream","Sand","Burgundy","Champagne","Tan","Charcoal","Pearl"];
    const match = colors.find((c) => row.title.toLowerCase().includes(c.toLowerCase()));
    return match || null;
  })();
  const city = row.location?.split(",")[0]?.trim() || "Dar es Salaam";
  const description = row.description || `${row.title}. Contact for more details.`;
  const imageUrl = row.imageUrl || null;

  // Insert listing
  const { data: listing, error: listingErr } = await supabase
    .from("listings")
    .insert({
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
    })
    .select()
    .single();

  if (listingErr) {
    console.error("❌ Failed to insert listing:", listingErr.message);
    process.exit(1);
  }

  console.log("✅ Listing inserted:", listing.id);

  // Insert image if available
  if (imageUrl) {
    const { error: imgErr } = await supabase.from("listing_images").insert({
      listing_id: listing.id,
      image_url: imageUrl,
      display_order: 0,
    });
    if (imgErr) {
      console.error("⚠️ Failed to insert image:", imgErr.message);
    } else {
      console.log("✅ Image inserted:", imageUrl);
    }
  }

  console.log("\n🎉 Done! Check the site at /listing/", listing.id);
  console.log("   Or browse /search to see it in the grid.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
