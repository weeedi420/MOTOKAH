/**
 * Fix RLS policies for the new Supabase project
 * Run: node scripts/fix-rls.cjs
 */

try { require("dotenv").config(); } catch {}

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("🔧 Fixing RLS policies...\n");

  // Allow anyone to read approved listings
  const { error: listingsErr } = await supabase.rpc("exec_sql", {
    sql: `
      CREATE POLICY IF NOT EXISTS "Anyone can read approved listings"
      ON public.listings FOR SELECT
      USING (status = 'approved');
    `
  });

  if (listingsErr) {
    // Try direct SQL if RPC doesn't exist
    const { error: sqlErr } = await supabase.from("listings").select("count()").limit(1);
    if (sqlErr?.code === "42501") {
      console.log("⚠️ RLS is blocking reads. You need to add this policy manually:");
      console.log(`
-- Run this in Supabase SQL Editor:
CREATE POLICY "Anyone can read approved listings"
ON public.listings FOR SELECT
USING (status = 'approved');

CREATE POLICY "Anyone can read listing images"
ON public.listing_images FOR SELECT
USING (true);
      `);
      process.exit(1);
    }
  }

  console.log("✅ RLS policies fixed!");

  // Verify
  const anonClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const { data, error } = await anonClient
    .from("listings")
    .select("id, title, price")
    .eq("status", "approved")
    .limit(3);

  if (error) {
    console.error("❌ Still can't read:", error.message);
  } else {
    console.log("✅ Anonymous read works:", data);
  }
}

main().catch(console.error);
