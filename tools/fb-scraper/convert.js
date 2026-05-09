import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, "output", "scraped-cars.json");

if (!existsSync(inputPath)) {
  console.error("❌ No scraped data found. Run: node scrape.js first");
  process.exit(1);
}

const posts = JSON.parse(readFileSync(inputPath, "utf8"));
console.log(`📦 Converting ${posts.length} scraped posts to mockData listings...\n`);

// Detect make/model from text
function detectMakeModel(text) {
  const patterns = [
    { make: "Toyota", models: ["land cruiser prado", "land cruiser", "hilux surf", "hilux", "fortuner", "vitz", "rush", "ractis", "wish", "vanguard", "prius", "aqua", "raum", "harrier", "vellfire", "alphard", "corolla", "crown", "ipsum", "kluger", "rumion", "ist"] },
    { make: "Nissan", models: ["patrol", "navara", "x-trail", "safari", "note", "march", "tiida", "serena", "civilian"] },
    { make: "Subaru", models: ["forester", "outback", "impreza", "legacy", "xv"] },
    { make: "Mitsubishi", models: ["pajero", "outlander", "canter", "eclipse"] },
    { make: "Mazda", models: ["demio", "cx-5", "cx-3", "verisa", "atenza", "axela"] },
    { make: "Honda", models: ["fit", "cr-v", "vezel", "freed", "stepwgn"] },
    { make: "Jeep", models: ["wrangler", "cherokee", "grand cherokee", "compass"] },
    { make: "Land Rover", models: ["discovery", "defender", "freelander", "range rover"] },
    { make: "BMW", models: ["320i", "325i", "x5", "x3", "series"] },
    { make: "Mercedes", models: ["c200", "c180", "e200", "ml", "glk", "a180"] },
    { make: "Hyundai", models: ["tucson", "santa fe", "i10", "accent"] },
    { make: "Isuzu", models: ["d-max", "dmax", "trooper", "npr"] },
  ];

  const lower = text.toLowerCase();
  for (const { make, models } of patterns) {
    for (const model of models) {
      if (lower.includes(model)) {
        const modelFormatted = model.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        return { make, model: modelFormatted };
      }
    }
    if (lower.includes(make.toLowerCase())) {
      return { make, model: make };
    }
  }
  return { make: "Unknown", model: "Vehicle" };
}

function detectTransmission(text) {
  const lower = text.toLowerCase();
  if (lower.includes("automatic") || lower.includes("auto ") || lower.includes("tiptronic")) return "Automatic";
  if (lower.includes("manual") || lower.includes("gearbox")) return "Manual";
  return "Automatic";
}

function detectCondition(text) {
  const lower = text.toLowerCase();
  if (lower.includes("foreign used") || lower.includes("foreign-used") || lower.includes("ex-japan") || lower.includes("ex japan")) return "Foreign Used";
  if (lower.includes("brand new") || lower.includes("0km") || lower.includes("0 km")) return "New";
  if (lower.includes("locally used") || lower.includes("local used")) return "Used";
  return "Foreign Used";
}

function detectLocation(text, group) {
  const lower = text.toLowerCase();
  if (lower.includes("dar es salaam") || lower.includes("dar ") || group.includes("Tanzania")) return "Dar es Salaam, TZ";
  if (lower.includes("arusha")) return "Arusha, TZ";
  if (lower.includes("mwanza")) return "Mwanza, TZ";
  if (lower.includes("mombasa")) return "Mombasa, KE";
  if (lower.includes("nairobi") || group.includes("Kenya")) return "Nairobi, KE";
  if (lower.includes("kampala") || group.includes("Uganda")) return "Kampala, UG";
  if (lower.includes("kigali") || group.includes("Rwanda")) return "Kigali, RW";
  return "Dar es Salaam, TZ";
}

function detectCurrency(location) {
  if (location.endsWith("KE")) return "KES";
  if (location.endsWith("UG")) return "UGX";
  if (location.endsWith("RW")) return "RWF";
  return "TZS";
}

let idCounter = 100; // start from mock-100 to avoid collisions

const listings = posts.map(post => {
  const { make, model } = detectMakeModel(post.text);
  const year = post.extracted.year || 2018;
  const price = post.extracted.price?.amount || 0;
  const currency = post.extracted.price?.currency || detectCurrency(detectLocation(post.text, post.sourceGroup));
  const location = detectLocation(post.text, post.sourceGroup);
  const id = `mock-${++idCounter}`;

  return {
    id,
    title: `${make} ${model} ${year}`,
    make,
    model,
    year,
    price,
    currency,
    originalPrice: null,
    condition: detectCondition(post.text),
    location,
    mileage: post.extracted.mileage || 0,
    transmission: detectTransmission(post.text),
    cc: post.extracted.cc || null,
    fuelType: "Petrol",
    color: "Not specified",
    doors: 4,
    seats: 5,
    image: post.images[0] || null,
    images: post.images,
    sellerName: post.authorName || "Private Seller",
    sellerId: null,
    sellerType: "private",
    sellerRating: 4.0,
    sellerPhone: post.extracted.phone || null,
    sellerListingCount: 1,
    views: Math.floor(Math.random() * 200) + 50,
    badge: null,
    discount: null,
    dutyPaid: false,
    description: post.text.slice(0, 500),
    sourceUrl: post.postUrl,
    _scraped: true,
  };
}).filter(l => l.price > 0 || l.images.length > 0);

console.log(`✅ Converted ${listings.length} listings`);

// Generate TypeScript snippet
const tsLines = listings.map(l => {
  const imagesArr = l.images.length > 0
    ? `[\n    ${l.images.map(i => `"${i}"`).join(",\n    ")}\n  ]`
    : "[]";

  return `  {
    id: "${l.id}",
    title: "${l.title}",
    make: "${l.make}",
    model: "${l.model}",
    year: ${l.year},
    price: ${l.price},
    currency: "${l.currency}",
    originalPrice: null,
    condition: "${l.condition}",
    location: "${l.location}",
    mileage: ${l.mileage},
    transmission: "${l.transmission}",
    cc: ${l.cc ?? "undefined"},
    fuelType: "Petrol",
    color: "Not specified",
    doors: 4,
    seats: 5,
    image: ${l.image ? `"${l.image}"` : "null"},
    images: ${imagesArr},
    sellerName: "${l.sellerName}",
    sellerId: null,
    sellerType: "private" as const,
    sellerRating: 4.0,
    sellerPhone: ${l.sellerPhone ? `"${l.sellerPhone}"` : "null"},
    sellerListingCount: 1,
    views: ${l.views},
    badge: undefined,
    discount: undefined,
    dutyPaid: false,
    description: \`${l.description.replace(/`/g, "'")}\`,
  }`;
});

const tsOutput = `// Auto-generated by tools/fb-scraper/convert.js
// Paste these into the mockListings array in src/data/mockData.ts

const scrapedListings = [
${tsLines.join(",\n")}
];
`;

const outputPath = join(__dirname, "output", "mockData-additions.ts");
writeFileSync(outputPath, tsOutput);
writeFileSync(join(__dirname, "output", "scraped-listings.json"), JSON.stringify(listings, null, 2));

console.log(`\n📄 Files written:`);
console.log(`   ${outputPath}`);
console.log(`   ${join(__dirname, "output", "scraped-listings.json")}`);
console.log(`\n👉 Next steps:`);
console.log(`   1. Review output/mockData-additions.ts`);
console.log(`   2. Copy listings from scrapedListings[] into mockListings[] in src/data/mockData.ts`);
console.log(`   3. Adjust prices/details as needed before calling sellers`);
