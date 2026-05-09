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
      return new Response(
        JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body for target URLs
    const body = await req.json().catch(() => ({}));
    const targetUrls: string[] = body.urls || [];
    const singleUrl: string | undefined = body.url;

    const urlsToScrape: string[] = [];
    if (singleUrl) urlsToScrape.push(singleUrl);
    if (targetUrls.length > 0) urlsToScrape.push(...targetUrls);

    // Fallback default: Facebook Marketplace vehicles in Nairobi
    if (urlsToScrape.length === 0) {
      urlsToScrape.push("https://www.facebook.com/marketplace/nairobi/vehicles/");
    }

    // Get or create scraper user
    let scraperId: string;
    const { data: scraperProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("display_name", "Facebook Imports")
      .single();

    if (scraperProfile) {
      scraperId = scraperProfile.user_id;
    } else {
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: "facebook.scraper@motokah.internal",
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: { display_name: "Facebook Imports" },
      });
      if (authErr) throw new Error(`Failed to create scraper user: ${authErr.message}`);
      scraperId = authUser.user.id;
      await supabase
        .from("profiles")
        .update({ display_name: "Facebook Imports", seller_type: "dealer" })
        .eq("user_id", scraperId);
    }

    const carBrands = [
      "Toyota", "Honda", "Suzuki", "Hyundai", "KIA", "Kia", "Nissan", "Mitsubishi",
      "Daihatsu", "Mercedes", "BMW", "Audi", "Volkswagen", "Changan", "MG", "Chery",
      "Proton", "FAW", "Isuzu", "Mazda", "Peugeot", "Land Rover", "Lexus", "Subaru",
      "Ford", "Volvo", "Jeep", "Tesla", "BYD",
    ];
    const tzCities = [
      "Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Zanzibar", "Mbeya",
      "Morogoro", "Tanga", "Iringa", "Moshi", "Nairobi", "Mombasa", "Kampala",
      "Kigali",
    ];

    interface CarData {
      title: string;
      make: string;
      model: string;
      year: number;
      price: number;
      mileage: number | null;
      transmission: string | null;
      fuel_type: string | null;
      city: string;
      image_url: string | null;
      description: string | null;
      source_url: string | null;
    }

    const allCars: CarData[] = [];

    for (const url of urlsToScrape) {
      console.log("Scraping Facebook:", url);
      const scrapeResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          waitFor: 3000,
        }),
      });

      const scrapeData = await scrapeResp.json();
      console.log("Scrape status:", scrapeResp.status);

      if (!scrapeResp.ok) {
        console.error("Scrape failed for", url, JSON.stringify(scrapeData).substring(0, 500));
        continue;
      }

      const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";
      console.log(`Got ${markdown.length} chars from ${url}`);

      // Parse cars from markdown
      const lines = markdown.split("\n");
      let cur: Partial<CarData> | null = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const hasBrand = carBrands.some((b) =>
          trimmed.toLowerCase().includes(b.toLowerCase())
        );
        const yearMatch = trimmed.match(/\b(20[0-2]\d|19[89]\d)\b/);

        if (hasBrand && yearMatch && trimmed.length < 180 && trimmed.length > 8) {
          if (cur?.title && cur.price && cur.price > 0) allCars.push(cur as CarData);

          const clean = trimmed
            .replace(/^[#*\->\s]+/, "")
            .replace(/\[|\]|\(.*?\)/g, "")
            .trim();
          const brand =
            carBrands.find((b) => clean.toLowerCase().includes(b.toLowerCase())) || "Unknown";
          const year = parseInt(yearMatch[1]);
          const modelPart = clean
            .replace(new RegExp(brand, "i"), "")
            .replace(String(year), "")
            .trim()
            .replace(/^[\s\-,]+|[\s\-,]+$/g, "");

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

        // Price — Facebook often shows "KSh 1,200,000" or "TZS 8,500,000"
        const pm = trimmed.match(
          /(?:KSh|TZS|USD|\$|£|€)\s*([\d,.]+)\s*(k|m|million|thousand)?/i
        );
        if (pm && !cur.price) {
          let n = parseFloat(pm[1].replace(/,/g, ""));
          const u = (pm[2] || "").toLowerCase();
          if (u.startsWith("k")) n *= 1000;
          if (u.startsWith("m")) n *= 1000000;
          if (u.startsWith("million")) n *= 1000000;
          if (u.startsWith("thousand")) n *= 1000;
          // Convert KSh -> TZS roughly (1 KSh ≈ 18 TZS)
          if (/ksh/i.test(pm[0])) n *= 18;
          cur.price = Math.round(n);
        }

        // Mileage
        const mm = trimmed.match(/([\d,]+)\s*km/i);
        if (mm && !cur.mileage) cur.mileage = parseInt(mm[1].replace(/,/g, ""));

        // Transmission / Fuel
        if (/\bautomatic\b/i.test(trimmed) && !cur.transmission)
          cur.transmission = "Automatic";
        if (/\bmanual\b/i.test(trimmed) && !cur.transmission)
          cur.transmission = "Manual";
        if (/\bpetrol\b/i.test(trimmed) && !cur.fuel_type) cur.fuel_type = "Petrol";
        if (/\bdiesel\b/i.test(trimmed) && !cur.fuel_type) cur.fuel_type = "Diesel";
        if (/\bhybrid\b/i.test(trimmed) && !cur.fuel_type) cur.fuel_type = "Hybrid";
        if (/\belectric\b/i.test(trimmed) && !cur.fuel_type) cur.fuel_type = "Electric";

        // Images
        const isValidCarImage = (url: string) =>
          /\.(jpg|jpeg|png|webp)/i.test(url) &&
          !/auction|inspection|logo|icon|sprite|placeholder|profile/i.test(url);

        const im = trimmed.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
        if (im && !cur.image_url && isValidCarImage(im[1])) cur.image_url = im[1];
        const plainImg = trimmed.match(/(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|webp))/i);
        if (plainImg && !cur.image_url && isValidCarImage(plainImg[1]))
          cur.image_url = plainImg[1];

        // Description accumulation
        if (trimmed.length > 20 && trimmed.length < 300) {
          cur.description = cur.description
            ? cur.description + " " + trimmed
            : trimmed;
        }
      }

      if (cur?.title && cur.price && cur.price > 0) allCars.push(cur as CarData);
    }

    console.log(`Parsed ${allCars.length} cars total`);

    // Insert into DB
    let inserted = 0;
    for (const car of allCars) {
      const { data: ex } = await supabase
        .from("listings")
        .select("id")
        .eq("make", car.make)
        .eq("model", car.model)
        .eq("year", car.year)
        .eq("price", car.price)
        .limit(1);
      if (ex && ex.length > 0) continue;

      const { data: listing, error: err } = await supabase
        .from("listings")
        .insert({
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
        })
        .select("id")
        .single();

      if (err) {
        console.error("Insert err:", err.message);
        continue;
      }

      if (car.image_url && listing) {
        await supabase.from("listing_images").insert({
          listing_id: listing.id,
          image_url: car.image_url,
          display_order: 0,
        });
      }
      inserted++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        scraped: allCars.length,
        inserted,
        message: `Scraped ${allCars.length} cars from Facebook, inserted ${inserted} new listings`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
