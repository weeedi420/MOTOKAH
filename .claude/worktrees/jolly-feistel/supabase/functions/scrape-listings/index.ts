import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get or create scraper user
    let scraperId: string;
    const { data: scraperProfile } = await supabase
      .from("profiles").select("user_id").eq("display_name", "AfriWheels Imports").single();

    if (scraperProfile) {
      scraperId = scraperProfile.user_id;
    } else {
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: "scraper@afriwheels.internal",
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: { display_name: "AfriWheels Imports" },
      });
      if (authErr) throw new Error(`Failed to create scraper user: ${authErr.message}`);
      scraperId = authUser.user.id;
      await supabase.from("profiles")
        .update({ display_name: "AfriWheels Imports", seller_type: "dealer" })
        .eq("user_id", scraperId);
    }

    // Scrape one page
    console.log("Scraping PakWheels...");
    const scrapeResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://www.pakwheels.com/used-cars/search/-/",
        formats: ["markdown"],
        waitFor: 2000,
      }),
    });

    const scrapeData = await scrapeResp.json();
    console.log("Scrape status:", scrapeResp.status);
    
    if (!scrapeResp.ok) {
      console.error("Scrape failed:", JSON.stringify(scrapeData).substring(0, 500));
      return new Response(JSON.stringify({ success: false, error: "Scrape failed", details: scrapeData.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";
    console.log(`Got ${markdown.length} chars. First 500:`, markdown.substring(0, 500));

    // Parse cars from markdown
    const carBrands = ["Toyota", "Honda", "Suzuki", "Hyundai", "KIA", "Kia", "Nissan", "Mitsubishi", "Daihatsu", "Mercedes", "BMW", "Audi", "Volkswagen", "Changan", "MG", "Chery", "Proton", "FAW", "Isuzu", "Mazda", "Peugeot", "Land Rover", "Lexus"];
    const tzCities = ["Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Zanzibar", "Mbeya", "Morogoro", "Tanga", "Iringa", "Moshi"];

    interface CarData {
      title: string; make: string; model: string; year: number; price: number;
      mileage: number | null; transmission: string | null; fuel_type: string | null;
      city: string; image_url: string | null;
    }

    const cars: CarData[] = [];
    const lines = markdown.split("\n");
    let cur: Partial<CarData> | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const hasBrand = carBrands.some(b => trimmed.toLowerCase().includes(b.toLowerCase()));
      const yearMatch = trimmed.match(/\b(20[0-2]\d|19[89]\d)\b/);

      if (hasBrand && yearMatch && trimmed.length < 150 && trimmed.length > 8) {
        if (cur?.title && cur.price && cur.price > 0) cars.push(cur as CarData);

        const clean = trimmed.replace(/^[#*\->\s]+/, "").replace(/\[|\]|\(.*?\)/g, "").trim();
        const brand = carBrands.find(b => clean.toLowerCase().includes(b.toLowerCase())) || "Unknown";
        const year = parseInt(yearMatch[1]);
        const modelPart = clean.replace(new RegExp(brand, "i"), "").replace(String(year), "").trim().replace(/^[\s\-,]+|[\s\-,]+$/g, "");

        cur = {
          title: clean, make: brand, model: modelPart || "Unknown", year,
          price: 0, mileage: null, transmission: null, fuel_type: null,
          city: tzCities[Math.floor(Math.random() * tzCities.length)], image_url: null,
        };
        continue;
      }

      if (!cur) continue;

      // Price
      const pm = trimmed.match(/(?:PKR|Rs\.?)\s*([\d,.]+)\s*(lacs?|lakhs?|crore)?/i);
      if (pm && !cur.price) {
        let n = parseFloat(pm[1].replace(/,/g, ""));
        const u = (pm[2] || "").toLowerCase();
        if (u.startsWith("lac") || u.startsWith("lakh")) n *= 100000;
        if (u.startsWith("crore")) n *= 10000000;
        cur.price = Math.round(n * 9);
      }

      const mm = trimmed.match(/([\d,]+)\s*km/i);
      if (mm && !cur.mileage) cur.mileage = parseInt(mm[1].replace(/,/g, ""));

      if (/\bautomatic\b/i.test(trimmed) && !cur.transmission) cur.transmission = "Automatic";
      if (/\bmanual\b/i.test(trimmed) && !cur.transmission) cur.transmission = "Manual";
      if (/\bpetrol\b/i.test(trimmed) && !cur.fuel_type) cur.fuel_type = "Petrol";
      if (/\bdiesel\b/i.test(trimmed) && !cur.fuel_type) cur.fuel_type = "Diesel";
      if (/\bhybrid\b/i.test(trimmed) && !cur.fuel_type) cur.fuel_type = "Hybrid";

      // Extract images but skip PakWheels assets/logos
      const isValidCarImage = (url: string) =>
        /\.(jpg|jpeg|png|webp)/i.test(url) &&
        /cache\d*\.pakwheels\.com\/ad_pictures/i.test(url) &&
        !/auction|inspection|logo|icon|sprite|placeholder/i.test(url);

      const im = trimmed.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
      if (im && !cur.image_url && isValidCarImage(im[1])) cur.image_url = im[1];
      const plainImg = trimmed.match(/(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|webp))/i);
      if (plainImg && !cur.image_url && isValidCarImage(plainImg[1])) cur.image_url = plainImg[1];
    }

    if (cur?.title && cur.price && cur.price > 0) cars.push(cur as CarData);

    console.log(`Parsed ${cars.length} cars`);

    // Insert
    let inserted = 0;
    for (const car of cars) {
      const { data: ex } = await supabase.from("listings").select("id")
        .eq("make", car.make).eq("model", car.model).eq("year", car.year).eq("price", car.price).limit(1);
      if (ex && ex.length > 0) continue;

      const { data: listing, error: err } = await supabase.from("listings").insert({
        seller_id: scraperId, title: car.title, make: car.make, model: car.model,
        year: car.year, price: car.price, currency: "TZS", mileage: car.mileage,
        transmission: car.transmission, fuel_type: car.fuel_type, city: car.city,
        condition: "Used", status: "approved",
      }).select("id").single();

      if (err) { console.error("Insert err:", err.message); continue; }

      if (car.image_url && listing) {
        await supabase.from("listing_images").insert({ listing_id: listing.id, image_url: car.image_url, display_order: 0 });
      }
      inserted++;
    }

    return new Response(JSON.stringify({
      success: true, scraped: cars.length, inserted,
      message: `Scraped ${cars.length} cars, inserted ${inserted} new listings`,
      sample_markdown: markdown.substring(0, 1000),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
