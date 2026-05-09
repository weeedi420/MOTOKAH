#!/usr/bin/env node
/**
 * Local Facebook scraper backfill script
 * Run: node scripts/backfill-facebook.js
 * Requires: FIRECRAWL_API_KEY and SUPABASE_SERVICE_ROLE_KEY env vars
 */

const { createClient } = require("@supabase/supabase-js");

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || "https://eiofmomywxcsezbyzjth.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!FIRECRAWL_API_KEY) {
  console.error("❌ Set FIRECRAWL_API_KEY env var first");
  process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Set SUPABASE_SERVICE_ROLE_KEY env var first");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const urlsToScrape = [
  "https://www.facebook.com/marketplace/nairobi/vehicles/",
  "https://www.facebook.com/marketplace/dar-es-salaam/vehicles/",
  "https://www.facebook.com/marketplace/mombasa/vehicles/",
  "https://www.facebook.com/marketplace/arusha/vehicles/",
  "https://www.facebook.com/marketplace/kampala/vehicles/",
  "https://www.facebook.com/marketplace/kigali/vehicles/",
];

const carBrands = [
  "Toyota", "Honda", "Suzuki", "Hyundai", "KIA", "Kia", "Nissan", "Mitsubishi",
  "Daihatsu", "Mercedes", "BMW", "Audi", "Volkswagen", "Changan", "MG", "Chery",
  "Proton", "FAW", "Isuzu", "Mazda", "Peugeot", "Land Rover", "Lexus", "Subaru",
  "Ford", "Volvo", "Jeep", "Tesla", "BYD",
];
const tzCities = [
  "Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Zanzibar", "Mbeya",
  "Morogoro", "Tanga", "Iringa", "Moshi", "Nairobi", "Mombasa", "Kampala", "Kigali",
];

async function scrapeFacebook() {
  console.log("🚗 Starting Facebook scraper backfill...\n");

  // Get or create scraper user
  let scraperId;
  const { data: scraperProfile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("display_name", "Facebook Imports")
    .single();

  if (scraperProfile) {
    scraperId = scraperProfile.user_id;
    console.log("✅ Using existing scraper user:", scraperId);
  } else {
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: "facebook.scraper@motokah.internal",
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { display_name: "Facebook Imports" },
    });
    if (authErr) throw new Error(`Failed to create scraper user: ${authErr.message}`);
    scraperId = authUser.user.id;
    await supabase.from("profiles").update({ display_name: "Facebook Imports", seller_type: "dealer" }).eq("user_id", scraperId);
    console.log("✅ Created scraper user:", scraperId);
  }

  const allCars = [];

  for (const url of urlsToScrape) {
    console.log("🔍 Scraping:", url);
    const scrapeResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        waitFor: 4000,
        actions: [
          { type: "wait", milliseconds: 2000 },
          { type: "scroll", direction: "down", amount: 800 },
          { type: "wait", milliseconds: 1500 },
          { type: "scroll", direction: "down", amount: 800 },
          { type: "wait", milliseconds: 1500 },
        ],
      }),
    });

    const scrapeData = await scrapeResp.json();
    if (!scrapeResp.ok) {
      console.error("❌ Scrape failed:", JSON.stringify(scrapeData).substring(0, 300));
      continue;
    }

    const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";
    console.log(`   Got ${markdown.length} chars`);

    // Parse cars
    const lines = markdown.split("\n");
    let cur = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const hasBrand = carBrands.some((b) => trimmed.toLowerCase().includes(b.toLowerCase()));
      const yearMatch = trimmed.match(/\b(20[0-2]\d|19[89]\d)\b/);

      if (hasBrand && yearMatch && trimmed.length < 180 && trimmed.length > 8) {
        if (cur?.title && cur.price > 0) allCars.push(cur);

        const clean = trimmed.replace(/^[#*\->\s]+/, "").replace(/\[|\]|\(.*?\)/g, "").trim();
        const brand = carBrands.find((b) => clean.toLowerCase().includes(b.toLowerCase())) || "Unknown";
        const year = parseInt(yearMatch[1]);
        const modelPart = clean.replace(new RegExp(brand, "i"), "").replace(String(year), "").trim().replace(/^[\s\-,]+|[\s\-,]+$/g, "");

        cur = {
          title: clean,
          make: brand,
          model: modelPart || "Unknown",
          year,
          price: 0,
          mileage: null,
          transmission: null,
          fuel_type: null,
          city: tzCities[Math.floor(Math.random() * tzCities.length)],
          image_url: null,
          description: null,
          source_url: url,
        };
        continue;
      }

      if (!cur) continue;

      const pm = trimmed.match(/(?:KSh|TZS|USD|\$|£|€)\s*([\d,.]+)\s*(k|m|million|thousand)?/i);
      if (pm && !cur.price) {
        let n = parseFloat(pm[1].replace(/,/g, ""));
        const u = (pm[2] || "").toLowerCase();
        if (u.startsWith("k")) n *= 1000;
        if (u.startsWith("m")) n *= 1000000;
        if (u.startsWith("million")) n *= 1000000;
        if (u.startsWith("thousand")) n *= 1000;
        if (/ksh/i.test(pm[0])) n *= 18;
        cur.price = Math.round(n);
      }

      const mm = trimmed.match(/([\d,]+)\s*km/i);
      if (mm && !cur.mileage) cur.mileage = parseInt(mm[1].replace(/,/g, ""));

      if (/\bautomatic\b/i.test(trimmed) && !cur.transmission) cur.transmission = "Automatic";
      if (/\bmanual\b/i.test(trimmed) && !cur.transmission) cur.transmission = "Manual";
      if (/\bpetrol\b/i.test(trimmed) && !cur.fuel_type) cur.fuel_type = "Petrol";
      if (/\bdiesel\b/i.test(trimmed) && !cur.fuel_type) cur.fuel_type = "Diesel";
      if (/\bhybrid\b/i.test(trimmed) && !cur.fuel_type) cur.fuel_type = "Hybrid";
      if (/\belectric\b/i.test(trimmed) && !cur.fuel_type) cur.fuel_type = "Electric";

      const isValidCarImage = (url) => /\.(jpg|jpeg|png|webp)/i.test(url) && !/auction|inspection|logo|icon|sprite|placeholder|profile/i.test(url);
      const im = trimmed.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
      if (im && !cur.image_url && isValidCarImage(im[1])) cur.image_url = im[1];
      const plainImg = trimmed.match(/(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|webp))/i);
      if (plainImg && !cur.image_url && isValidCarImage(plainImg[1])) cur.image_url = plainImg[1];

      if (trimmed.length > 20 && trimmed.length < 300) {
        cur.description = cur.description ? cur.description + " " + trimmed : trimmed;
      }
    }

    if (cur?.title && cur.price > 0) allCars.push(cur);
  }

  console.log(`\n📊 Parsed ${allCars.length} cars total`);

  // Insert
  let inserted = 0;
  for (const car of allCars) {
    const { data: ex } = await supabase.from("listings").select("id")
      .eq("make", car.make).eq("model", car.model).eq("year", car.year).eq("price", car.price).limit(1);
    if (ex && ex.length > 0) continue;

    const { data: listing, error: err } = await supabase.from("listings").insert({
      seller_id: scraperId,
      title: car.title,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      currency: "TZS",
      mileage: car.mileage,
      transmission: car.transmission,
      fuel_type: car.fuel_type,
      city: car.city,
      condition: "Used",
      status: "approved",
      description: car.description,
    }).select("id").single();

    if (err) { console.error("Insert err:", err.message); continue; }

    if (car.image_url && listing) {
      await supabase.from("listing_images").insert({
        listing_id: listing.id, image_url: car.image_url, display_order: 0,
      });
    }
    inserted++;
  }

  console.log(`\n✅ DONE! Scraped ${allCars.length}, inserted ${inserted} new listings.`);
}

scrapeFacebook().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
