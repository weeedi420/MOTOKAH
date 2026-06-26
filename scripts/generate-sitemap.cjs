/**
 * Generates public/sitemap.xml at build time.
 * Run: node scripts/generate-sitemap.cjs
 */
const fs = require("fs");
const path = require("path");

const BASE = "https://www.motokah.com";
const TODAY = new Date().toISOString().split("T")[0];

const igShowrooms = [
  "mgayamotors","khushimotorsdaressalaam","njari_motors","ruge_magari",
  "al_husnainmotors","lomaautos_","magari_empire1","dula_magari",
  "rwanko_motors","cholloh_magari_tz","breemotors","ndinga_bei_poa",
  "tgworldimports","ezy_auto_motors","hanami.japan","fau_motors",
  "evanamotors","barari_motorstz",
  "livy_motors_tz","expert_motors_tz","ibaraki",
  "justin_motors_ltd","hupa_motors_ltd","kk_magic_cars_",
];

const staticPages = [
  { path: "/",               freq: "daily",   pri: 1.0 },
  { path: "/search",         freq: "daily",   pri: 0.9 },
  { path: "/sell",           freq: "weekly",  pri: 0.8 },
  { path: "/dealer-leads",   freq: "weekly",  pri: 0.8 },
  { path: "/how-it-works",   freq: "monthly", pri: 0.7 },
  { path: "/duty-calculator",freq: "monthly", pri: 0.7 },
  { path: "/compare",        freq: "weekly",  pri: 0.6 },
  { path: "/blog",           freq: "weekly",  pri: 0.6 },
  { path: "/about",          freq: "monthly", pri: 0.5 },
  { path: "/contact",        freq: "monthly", pri: 0.5 },
  { path: "/faq",            freq: "monthly", pri: 0.4 },
  { path: "/safety",         freq: "monthly", pri: 0.4 },
  { path: "/terms",          freq: "monthly", pri: 0.3 },
  { path: "/privacy",        freq: "monthly", pri: 0.3 },
  ...igShowrooms.map(u => ({ path: `/showroom/${u}`, freq: "weekly", pri: 0.7 })),
];

const cities = [
  // Tanzania
  { slug: "dar-es-salaam",  pri: 0.9 }, { slug: "arusha",          pri: 0.8 },
  { slug: "mwanza",         pri: 0.8 }, { slug: "dodoma",          pri: 0.7 },
  { slug: "zanzibar",       pri: 0.8 }, { slug: "mbeya",           pri: 0.7 },
  { slug: "moshi",          pri: 0.7 }, { slug: "tanga",           pri: 0.6 },
  { slug: "morogoro",       pri: 0.6 }, { slug: "iringa",          pri: 0.5 },
  { slug: "kigoma",         pri: 0.5 }, { slug: "tabora",          pri: 0.5 },
  { slug: "lindi",          pri: 0.5 }, { slug: "shinyanga",       pri: 0.5 },
  { slug: "kahama",         pri: 0.5 }, { slug: "musoma",          pri: 0.5 },
  { slug: "sumbawanga",     pri: 0.4 }, { slug: "songea",          pri: 0.4 },
  { slug: "bukoba",         pri: 0.4 }, { slug: "mtwara",          pri: 0.4 },
  // Kenya
  { slug: "nairobi",        pri: 0.9 }, { slug: "mombasa",         pri: 0.8 },
  { slug: "nakuru",         pri: 0.7 }, { slug: "kisumu",          pri: 0.7 },
  { slug: "eldoret",        pri: 0.7 }, { slug: "thika",           pri: 0.6 },
  { slug: "naivasha",       pri: 0.6 }, { slug: "nyeri",           pri: 0.5 },
  { slug: "machakos",       pri: 0.5 }, { slug: "meru",            pri: 0.5 },
  { slug: "kitale",         pri: 0.5 }, { slug: "malindi",         pri: 0.5 },
  // Uganda
  { slug: "kampala",        pri: 0.8 }, { slug: "entebbe",         pri: 0.7 },
  { slug: "jinja",          pri: 0.6 }, { slug: "mbarara",         pri: 0.6 },
  { slug: "gulu",           pri: 0.5 }, { slug: "fort-portal",     pri: 0.5 },
  // Rwanda
  { slug: "kigali",         pri: 0.7 }, { slug: "butare",          pri: 0.5 },
  // Ethiopia
  { slug: "addis-ababa",    pri: 0.7 }, { slug: "adama",           pri: 0.5 },
  { slug: "dire-dawa",      pri: 0.5 },
];

const makes = [
  "toyota", "nissan", "honda", "subaru", "mazda", "mitsubishi",
  "land-rover", "bmw", "mercedes-benz", "audi", "ford", "volkswagen",
  "hyundai", "kia", "suzuki", "isuzu", "jeep", "lexus",
];

// Search pages by make (high-value SEO)
const makePages = makes.map(make => ({
  path: `/search?make=${encodeURIComponent(make.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" "))}`,
  freq: "daily",
  pri: 0.8,
}));

// City + make combos (top cities × top makes) — proper URL params
const topCities = ["dar-es-salaam", "nairobi", "kampala", "arusha", "mombasa", "kigali", "mwanza", "zanzibar"];
const topMakes = ["toyota", "nissan", "honda", "subaru", "land-rover", "mitsubishi", "mazda", "isuzu"];
const toTitleCase = s => s.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
const cityMakePages = topCities.flatMap(city =>
  topMakes.map(make => ({
    path: `/search?city=${encodeURIComponent(toTitleCase(city))}&make=${encodeURIComponent(toTitleCase(make))}`,
    freq: "weekly",
    pri: 0.65,
  }))
);

// Model landing pages — /cars/:make/:model (high-volume keyword targets)
const modelPages = [
  { make: "toyota",   model: "alphard",      pri: 0.9 },
  { make: "toyota",   model: "harrier",      pri: 0.9 },
  { make: "toyota",   model: "probox",       pri: 0.9 },
  { make: "toyota",   model: "fielder",      pri: 0.9 },
  { make: "toyota",   model: "vitz",         pri: 0.9 },
  { make: "toyota",   model: "land-cruiser", pri: 0.9 },
  { make: "toyota",   model: "hilux",        pri: 0.9 },
  { make: "toyota",   model: "prado",        pri: 0.8 },
  { make: "toyota",   model: "noah",         pri: 0.8 },
  { make: "toyota",   model: "succeed",      pri: 0.7 },
  { make: "toyota",   model: "axio",         pri: 0.8 },
  { make: "mazda",    model: "demio",        pri: 0.9 },
  { make: "mazda",    model: "cx-5",         pri: 0.8 },
  { make: "mazda",    model: "atenza",       pri: 0.7 },
  { make: "honda",    model: "vezel",        pri: 0.9 },
  { make: "honda",    model: "fit",          pri: 0.8 },
  { make: "honda",    model: "crv",          pri: 0.8 },
  { make: "subaru",   model: "forester",     pri: 0.9 },
  { make: "subaru",   model: "outback",      pri: 0.8 },
  { make: "subaru",   model: "impreza",      pri: 0.8 },
  { make: "nissan",   model: "x-trail",      pri: 0.8 },
  { make: "nissan",   model: "note",         pri: 0.8 },
  { make: "nissan",   model: "navara",       pri: 0.8 },
  { make: "mitsubishi", model: "pajero",     pri: 0.8 },
  { make: "mitsubishi", model: "outlander",  pri: 0.7 },
].map(({ make, model, pri }) => ({
  path: `/cars/${make}/${model}`,
  freq: "weekly",
  pri,
}));

// Blog posts (add slug here when publishing new posts)
const blogPostSlugs = [
  "how-to-import-a-car-to-kenya-2026",
  "best-used-cars-under-2-million-nairobi-2026",
  "bei-ya-magari-mitumba-tanzania-2026",
];
const blogPostPages = blogPostSlugs.map(slug => ({
  path: `/blog/${slug}`,
  freq: "monthly",
  pri: 0.7,
}));

// Country-level search pages
const countryPages = ["Kenya","Tanzania","Uganda","Rwanda","Ethiopia"].map(c => ({
  path: `/search?country=${encodeURIComponent(c)}`,
  freq: "daily",
  pri: 0.85,
}));

function url(loc, changefreq, priority, lastmod = TODAY) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

const lines = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
  `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
  `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9`,
  `          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`,
  "",
  "  <!-- Static pages -->",
  ...staticPages.map(p => url(`${BASE}${p.path}`, p.freq, p.pri)),
  "",
  "  <!-- City landing pages -->",
  ...cities.map(c => url(`${BASE}/city/${c.slug}`, "daily", c.pri)),
  "",
  "  <!-- Make search pages -->",
  ...makePages.map(p => url(`${BASE}${p.path}`, p.freq, p.pri)),
  "",
  "  <!-- City + make combo pages -->",
  ...cityMakePages.map(p => url(`${BASE}${p.path}`, p.freq, p.pri)),
  "",
  "  <!-- Country search pages -->",
  ...countryPages.map(p => url(`${BASE}${p.path}`, p.freq, p.pri)),
  "",
  "  <!-- Model landing pages -->",
  ...modelPages.map(p => url(`${BASE}${p.path}`, p.freq, p.pri)),
  "",
  "  <!-- Blog posts -->",
  ...blogPostPages.map(p => url(`${BASE}${p.path}`, p.freq, p.pri)),
  "",
  "</urlset>",
];

const out = lines.join("\n");
const dest = path.join(__dirname, "../public/sitemap.xml");
fs.writeFileSync(dest, out, "utf8");
console.log(`Sitemap written: ${dest}`);
console.log(`URLs: ${staticPages.length + cities.length + makePages.length + cityMakePages.length + countryPages.length + modelPages.length + blogPostPages.length}`);
