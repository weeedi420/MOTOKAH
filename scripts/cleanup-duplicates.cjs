/**
 * Clean up duplicate listings in Supabase
 * Run: node scripts/cleanup-duplicates.cjs
 */

try { require("dotenv").config(); } catch {}

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("🧹 Cleaning up duplicate listings...\n");

  // 1. Fetch all listings
  const { data: allListings, error: fetchError } = await supabase
    .from("listings")
    .select("id, title, make, model, year, city, price, listing_images(image_url)")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("❌ Failed to fetch listings:", fetchError.message);
    process.exit(1);
  }

  console.log(`📊 Total listings: ${allListings.length}`);

  // 2. Find duplicates by image URL (same Instagram image)
  const imageUrlMap = new Map();
  const duplicateIds = new Set();

  for (const listing of allListings) {
    const images = listing.listing_images || [];
    for (const img of images) {
      const url = img.image_url;
      if (url) {
        if (imageUrlMap.has(url)) {
          // Mark this listing as duplicate (keep the first one)
          duplicateIds.add(listing.id);
          console.log(`🔍 Duplicate image found: ${listing.title} (ID: ${listing.id})`);
        } else {
          imageUrlMap.set(url, listing.id);
        }
      }
    }
  }

  // 3. Find duplicates by make+model+year+city (same vehicle, different source)
  const vehicleKeyMap = new Map();

  for (const listing of allListings) {
    if (duplicateIds.has(listing.id)) continue; // Skip already marked

    const key = `${listing.make?.toLowerCase() || ''}|${listing.model?.toLowerCase() || ''}|${listing.year}|${listing.city?.toLowerCase() || ''}`;
    if (vehicleKeyMap.has(key)) {
      duplicateIds.add(listing.id);
      console.log(`🔍 Duplicate vehicle found: ${listing.title} (ID: ${listing.id})`);
    } else {
      vehicleKeyMap.set(key, listing.id);
    }
  }

  // 4. Find listings with 0 or null prices
  const zeroPriceIds = allListings
    .filter(l => !l.price || l.price <= 0)
    .map(l => l.id);

  zeroPriceIds.forEach(id => {
    duplicateIds.add(id);
    console.log(`💰 Zero price listing: ID ${id}`);
  });

  // 5. Delete duplicates
  const idsToDelete = [...duplicateIds];
  console.log(`\n🗑️  Total duplicates to delete: ${idsToDelete.length}`);

  if (idsToDelete.length === 0) {
    console.log("✅ No duplicates found!");
    return;
  }

  // Delete in batches of 100
  const batchSize = 100;
  let deleted = 0;

  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batch = idsToDelete.slice(i, i + batchSize);
    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .in("id", batch);

    if (deleteError) {
      console.error(`❌ Failed to delete batch ${i / batchSize + 1}:`, deleteError.message);
    } else {
      deleted += batch.length;
      console.log(`✅ Deleted batch ${i / batchSize + 1}: ${batch.length} listings`);
    }
  }

  console.log(`\n✅ Cleanup complete! Deleted ${deleted} duplicate listings.`);
  console.log(`📊 Remaining listings: ${allListings.length - deleted}`);
}

main().catch(console.error);
