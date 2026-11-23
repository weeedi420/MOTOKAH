/**
 * sim-new-listings.mjs
 *
 * Sends fake activity notifications to motokahafrica@gmail.com to simulate
 * an active marketplace. Sends a mix of "new listing" and "new signup" emails.
 *
 * Usage:
 *   node scripts/sim-new-listings.mjs             # auto mode: 1-3 mixed events
 *   node scripts/sim-new-listings.mjs --count 5   # send exactly 5
 *   node scripts/sim-new-listings.mjs --type listing   # listings only
 *   node scripts/sim-new-listings.mjs --type signup    # signups only
 *   node scripts/sim-new-listings.mjs --type analytics # weekly growth report only
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ADMIN_INBOX = "motokahafrica@gmail.com";

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local");
  process.exit(1);
}

// ── Name pools ────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Amani", "Baraka", "Chidi", "Daudi", "Emmanuel", "Farida", "Grace", "Hassan",
  "Ibrahim", "Juma", "Kioni", "Lilian", "Musa", "Neema", "Omar", "Pendo",
  "Rashid", "Salma", "Tariq", "Upendo", "Valentine", "Wanjiru", "Yusuf", "Zawadi",
  "Abdi", "Beatrice", "Calleb", "Dorcas", "Evans", "Fatuma", "George", "Halima",
  "Ismail", "Joyce", "Kipchoge", "Leila", "Moses", "Naomi", "Ochieng", "Priscilla",
  "Ruth", "Samuel", "Tabitha", "Victor", "Wambua", "Amara", "Boniface", "Caroline",
  "Dennis", "Elizabeth", "Felix", "Gloria", "Henry", "Irene", "Jackson", "Kelvin",
  "Lydia", "Martin", "Nadia", "Paul", "Rehema", "Simon", "Tina", "Usman",
];

const LAST_NAMES = [
  "Mwangi", "Odhiambo", "Kamau", "Njoroge", "Kiplagat", "Achieng", "Omondi", "Wambua",
  "Msomi", "Makame", "Juma", "Hassan", "Salim", "Rashidi", "Musa", "Otieno",
  "Kamande", "Gatheru", "Wanjiku", "Muriu", "Gitau", "Karanja", "Ngugi", "Kimani",
  "Banda", "Phiri", "Tembo", "Mwamba", "Zulu", "Dlamini", "Nkosi", "Sithole",
  "Mensah", "Asante", "Boateng", "Adjei", "Owusu", "Acheampong", "Darko", "Quaye",
  "Waweru", "Waithaka", "Maina", "Mumo", "Mutua", "Musyoka", "Ndung'u", "Kihara",
  "Osei", "Nkrumah", "Addo", "Agyemang", "Obeng", "Sarfo", "Tetteh", "Ankrah",
];

const CITIES = [
  // Tanzania (highest weight — primary market)
  "Dar es Salaam", "Dar es Salaam", "Dar es Salaam", "Dar es Salaam",
  "Arusha", "Arusha", "Mwanza", "Dodoma", "Zanzibar", "Moshi",
  // Kenya
  "Nairobi", "Nairobi", "Nairobi", "Mombasa", "Mombasa", "Kisumu", "Nakuru",
  // Uganda
  "Kampala", "Kampala", "Jinja", "Entebbe",
  // Ethiopia
  "Addis Ababa",
];

const CARS = [
  { make: "Toyota",        model: "IST",               cc: 1300, price: () => ri(6_500_000, 14_000_000),  currency: "TZS", year: () => ri(2010, 2018) },
  { make: "Toyota",        model: "Vitz",              cc: 1000, price: () => ri(5_000_000, 11_000_000),  currency: "TZS", year: () => ri(2010, 2019) },
  { make: "Toyota",        model: "Fielder",           cc: 1500, price: () => ri(10_000_000, 22_000_000), currency: "TZS", year: () => ri(2012, 2020) },
  { make: "Toyota",        model: "Harrier",           cc: 2000, price: () => ri(22_000_000, 50_000_000), currency: "TZS", year: () => ri(2010, 2017) },
  { make: "Toyota",        model: "Land Cruiser Prado",cc: 2700, price: () => ri(60_000_000, 110_000_000),currency: "TZS", year: () => ri(2008, 2016) },
  { make: "Toyota",        model: "Probox",            cc: 1300, price: () => ri(6_000_000, 13_000_000),  currency: "TZS", year: () => ri(2008, 2018) },
  { make: "Toyota",        model: "Sienta",            cc: 1500, price: () => ri(14_000_000, 26_000_000), currency: "TZS", year: () => ri(2012, 2020) },
  { make: "Toyota",        model: "Wish",              cc: 1800, price: () => ri(12_000_000, 22_000_000), currency: "TZS", year: () => ri(2008, 2016) },
  { make: "Toyota",        model: "Premio",            cc: 1800, price: () => ri(14_000_000, 28_000_000), currency: "TZS", year: () => ri(2010, 2018) },
  { make: "Toyota",        model: "Allion",            cc: 1800, price: () => ri(13_000_000, 26_000_000), currency: "TZS", year: () => ri(2010, 2018) },
  { make: "Mazda",         model: "Demio",             cc: 1300, price: () => ri(6_000_000, 13_000_000),  currency: "TZS", year: () => ri(2010, 2019) },
  { make: "Mazda",         model: "Atenza",            cc: 2000, price: () => ri(15_000_000, 28_000_000), currency: "TZS", year: () => ri(2010, 2017) },
  { make: "Mazda",         model: "CX-5",              cc: 2000, price: () => ri(28_000_000, 55_000_000), currency: "TZS", year: () => ri(2012, 2019) },
  { make: "Nissan",        model: "Note",              cc: 1200, price: () => ri(7_000_000, 15_000_000),  currency: "TZS", year: () => ri(2010, 2019) },
  { make: "Nissan",        model: "X-Trail",           cc: 2000, price: () => ri(18_000_000, 40_000_000), currency: "TZS", year: () => ri(2008, 2017) },
  { make: "Nissan",        model: "Tiida",             cc: 1500, price: () => ri(7_000_000, 15_000_000),  currency: "TZS", year: () => ri(2008, 2015) },
  { make: "Subaru",        model: "Forester",          cc: 2000, price: () => ri(20_000_000, 42_000_000), currency: "TZS", year: () => ri(2010, 2018) },
  { make: "Subaru",        model: "Outback",           cc: 2500, price: () => ri(22_000_000, 48_000_000), currency: "TZS", year: () => ri(2010, 2018) },
  { make: "Honda",         model: "Fit",               cc: 1300, price: () => ri(7_000_000, 16_000_000),  currency: "TZS", year: () => ri(2010, 2019) },
  { make: "Honda",         model: "Freed",             cc: 1500, price: () => ri(12_000_000, 24_000_000), currency: "TZS", year: () => ri(2010, 2018) },
  { make: "Mitsubishi",    model: "Outlander",         cc: 2000, price: () => ri(18_000_000, 40_000_000), currency: "TZS", year: () => ri(2008, 2017) },
  { make: "Mitsubishi",    model: "RVR",               cc: 1800, price: () => ri(14_000_000, 28_000_000), currency: "TZS", year: () => ri(2010, 2018) },
  { make: "Mercedes-Benz", model: "C200",              cc: 2000, price: () => ri(25_000_000, 55_000_000), currency: "TZS", year: () => ri(2008, 2016) },
];

const CONDITIONS   = ["Foreign Used", "Foreign Used", "Foreign Used", "Locally Used", "New"];
const COLORS       = ["White", "Silver", "Black", "Pearl White", "Grey", "Blue", "Maroon", "Champagne", "Red"];
const SELLER_TYPES = ["Private Seller", "Private Seller", "Dealer", "Private Seller", "Individual"];

const PHONE_PREFIX = { Tanzania: "+255", Kenya: "+254", Uganda: "+256", Ethiopia: "+251" };
const CITY_COUNTRY = {
  "Dar es Salaam": "Tanzania", "Arusha": "Tanzania", "Mwanza": "Tanzania",
  "Dodoma": "Tanzania",        "Zanzibar": "Tanzania", "Moshi": "Tanzania",
  "Nairobi": "Kenya",          "Mombasa": "Kenya",   "Kisumu": "Kenya", "Nakuru": "Kenya",
  "Kampala": "Uganda",         "Jinja": "Uganda",    "Entebbe": "Uganda",
  "Addis Ababa": "Ethiopia",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const ri  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr)     => arr[Math.floor(Math.random() * arr.length)];

function fakePerson(city) {
  const country  = CITY_COUNTRY[city] || "Tanzania";
  const prefix   = PHONE_PREFIX[country] || "+255";
  const first    = pick(FIRST_NAMES);
  const last     = pick(LAST_NAMES);
  const digits   = String(ri(700_000_000, 799_999_999));
  const phone    = `${prefix} ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  const domains  = ["gmail.com", "gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
  const email    = `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}${ri(10, 99)}@${pick(domains)}`;
  return { name: `${first} ${last}`, email, phone };
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Email builders ────────────────────────────────────────────────────────────

function buildListingEmail(listing) {
  const { title, price, currency, city, condition, color, mileage, year, make, model, cc } = listing;
  return {
    subject: `New Listing: ${year} ${make} ${model} — ${city}`,
    html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <!-- Header -->
  <div style="background:#0284c7;padding:28px 32px 24px;border-radius:12px 12px 0 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      <tr>
        <td>
          <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px">motokah</span>
          <span style="font-size:22px;font-weight:300;color:rgba(255,255,255,0.7)">.com</span>
        </td>
        <td align="right">
          <span style="background:rgba(255,255,255,0.15);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;letter-spacing:.5px;text-transform:uppercase">New Listing</span>
        </td>
      </tr>
    </table>
  </div>
  <!-- Body -->
  <div style="background:#f8fafc;padding:0 0 24px">
    <!-- Car card -->
    <div style="background:#ffffff;margin:24px 24px 0;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.07)">
      <!-- Colour stripe -->
      <div style="height:5px;background:linear-gradient(90deg,#0284c7,#38bdf8)"></div>
      <div style="padding:20px 22px">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#0284c7;text-transform:uppercase;letter-spacing:.6px">${esc(condition)}</p>
        <h2 style="margin:0 0 2px;font-size:20px;font-weight:800;color:#0f172a">${esc(year)} ${esc(make)} ${esc(model)}</h2>
        <p style="margin:0 0 18px;font-size:13px;color:#64748b">${cc}cc &bull; ${esc(color)}</p>
        <!-- Stats row -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:1px solid #f1f5f9;padding-top:16px">
          <tr>
            <td style="padding-top:16px;width:33%">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px">Price</p>
              <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#0284c7">${esc(currency)} ${Number(price).toLocaleString()}</p>
            </td>
            <td style="padding-top:16px;width:33%;text-align:center">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px">Mileage</p>
              <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#0f172a">${Number(mileage).toLocaleString()} km</p>
            </td>
            <td style="padding-top:16px;width:33%;text-align:right">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px">Location</p>
              <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#0f172a">${esc(city)}</p>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <!-- CTA -->
    <div style="text-align:center;margin:24px 24px 0">
      <a href="https://www.motokah.com/admin/listings" style="display:inline-block;background:#0284c7;color:#ffffff;font-size:14px;font-weight:700;padding:13px 32px;border-radius:8px;text-decoration:none;letter-spacing:.2px">Review &amp; Approve →</a>
    </div>
  </div>
  <!-- Footer -->
  <div style="background:#f1f5f9;padding:16px 24px;border-radius:0 0 12px 12px;text-align:center">
    <p style="margin:0;font-size:11px;color:#94a3b8">Motokah Marketplace &bull; Admin notification &bull; <a href="https://www.motokah.com/admin" style="color:#0284c7;text-decoration:none">Open Dashboard</a></p>
  </div>
</div>`,
  };
}

function buildSignupEmail(person, city, sellerType) {
  const typeIcon = sellerType === "Dealer" ? "🏢" : "👤";
  const typeLabel = sellerType === "Dealer" ? "Dealer Account" : "Private Seller";
  return {
    subject: `New signup on Motokah — ${city}`,
    html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <!-- Header -->
  <div style="background:#0284c7;padding:28px 32px 24px;border-radius:12px 12px 0 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      <tr>
        <td>
          <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px">motokah</span>
          <span style="font-size:22px;font-weight:300;color:rgba(255,255,255,0.7)">.com</span>
        </td>
        <td align="right">
          <span style="background:rgba(255,255,255,0.15);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;letter-spacing:.5px;text-transform:uppercase">New Signup</span>
        </td>
      </tr>
    </table>
  </div>
  <!-- Body -->
  <div style="background:#f8fafc;padding:0 0 24px">
    <!-- Signup card -->
    <div style="background:#ffffff;margin:24px 24px 0;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.07)">
      <div style="height:5px;background:linear-gradient(90deg,#0284c7,#38bdf8)"></div>
      <div style="padding:28px 22px;text-align:center">
        <div style="display:inline-block;width:52px;height:52px;background:#eff6ff;border-radius:50%;line-height:52px;font-size:24px;margin-bottom:14px">${typeIcon}</div>
        <h2 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#0f172a">Someone just joined Motokah</h2>
        <p style="margin:0;font-size:14px;color:#64748b">A new user created an account on the platform</p>
        <!-- Chips -->
        <div style="margin-top:20px">
          <span style="display:inline-block;background:#eff6ff;color:#0284c7;font-size:12px;font-weight:600;padding:6px 14px;border-radius:20px;margin:4px">${esc(typeLabel)}</span>
          <span style="display:inline-block;background:#f1f5f9;color:#475569;font-size:12px;font-weight:600;padding:6px 14px;border-radius:20px;margin:4px">📍 ${esc(city)}</span>
        </div>
      </div>
    </div>
    <!-- CTA -->
    <div style="text-align:center;margin:24px 24px 0">
      <a href="https://www.motokah.com/admin/users" style="display:inline-block;background:#0284c7;color:#ffffff;font-size:14px;font-weight:700;padding:13px 32px;border-radius:8px;text-decoration:none;letter-spacing:.2px">View Users →</a>
    </div>
  </div>
  <!-- Footer -->
  <div style="background:#f1f5f9;padding:16px 24px;border-radius:0 0 12px 12px;text-align:center">
    <p style="margin:0;font-size:11px;color:#94a3b8">Motokah Marketplace &bull; Admin notification &bull; <a href="https://www.motokah.com/admin" style="color:#0284c7;text-decoration:none">Open Dashboard</a></p>
  </div>
</div>`,
  };
}

// ── Event generator ───────────────────────────────────────────────────────────

function generateListingEvent() {
  const city      = pick(CITIES);
  const car       = pick(CARS);
  const year      = car.year();
  const color     = pick(COLORS);
  const mileage   = ri(18_000, 140_000);
  const title     = `${year} ${car.make} ${car.model} ${car.cc}cc ${color}`;
  return buildListingEmail({ title, price: car.price(), currency: car.currency, city, condition: pick(CONDITIONS), color, mileage, year, make: car.make, model: car.model, cc: car.cc });
}

function generateSignupEvent() {
  const city    = pick(CITIES);
  const person  = fakePerson(city);
  const type    = pick(SELLER_TYPES);
  return buildSignupEmail(person, city, type);
}

// ── Analytics report builder ─────────────────────────────────────────────────

function buildAnalyticsEmail() {
  const visitors    = ri(620, 1850);
  const prevVisit   = Math.round(visitors / (1 + (ri(8, 28) / 100)));
  const visitChg    = Math.round(((visitors - prevVisit) / prevVisit) * 100);
  const leads       = ri(4, 22);
  const wishlistAdd = ri(18, 74);
  const pageViews   = visitors * ri(2, 4) + ri(0, 300);
  const topCity     = pick(["Dar es Salaam", "Nairobi", "Arusha", "Mombasa", "Kampala"]);
  const topModel    = pick(["Toyota IST", "Toyota Fielder", "Toyota Vitz", "Mazda Demio", "Subaru Forester", "Toyota Harrier", "Nissan Note"]);
  const rankFrom    = ri(16, 28);
  const rankTo      = ri(2, 6);
  const keyword     = `${topModel} ${pick(["Tanzania", "Kenya", "for sale", "price"])}`;
  const newListings = ri(3, 18);
  const mobileChg   = ri(4, 19);
  const bounce      = ri(44, 68);

  // Pick a random week ending today-ish
  const now   = new Date();
  const weekEnd = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const weekStart = new Date(now - 7 * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const subject = `Motokah Weekly Report — ${weekStart}–${weekEnd}`;

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:620px;margin:0 auto;background:#ffffff">
  <div style="background:#0284c7;padding:28px 32px 24px;border-radius:12px 12px 0 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      <tr>
        <td>
          <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px">motokah</span>
          <span style="font-size:22px;font-weight:300;color:rgba(255,255,255,0.7)">.com</span>
        </td>
        <td align="right">
          <span style="background:rgba(255,255,255,0.15);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;letter-spacing:.5px;text-transform:uppercase">Weekly Report</span>
        </td>
      </tr>
    </table>
    <p style="margin:16px 0 0;font-size:16px;font-weight:700;color:#fff">📊 Site Performance — ${weekStart}–${weekEnd}</p>
  </div>
  <div style="padding:24px">
    <!-- KPI row -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px;text-align:center">
        <p style="margin:0;font-size:22px;font-weight:800;color:#0284c7">${visitors.toLocaleString()}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Visitors</p>
        <p style="margin:2px 0 0;font-size:12px;color:#16a34a;font-weight:600">↑ ${visitChg}% vs prev week</p>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;text-align:center">
        <p style="margin:0;font-size:22px;font-weight:800;color:#16a34a">${leads}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Buyer Leads</p>
        <p style="margin:2px 0 0;font-size:12px;color:#0284c7;font-weight:600">${leads > 10 ? "Strong week" : "Growing"}</p>
      </div>
      <div style="background:#fdf4ff;border:1px solid #e9d5ff;border-radius:8px;padding:14px;text-align:center">
        <p style="margin:0;font-size:22px;font-weight:800;color:#9333ea">${pageViews.toLocaleString()}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.5px">Page Views</p>
        <p style="margin:2px 0 0;font-size:12px;color:#9333ea;font-weight:600">Avg ${(pageViews / visitors).toFixed(1)} / visit</p>
      </div>
    </div>

    <!-- SEO highlight -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;margin-bottom:16px">
      <p style="margin:0;font-size:13px;font-weight:700;color:#92400e">🔍 Google Ranking Update</p>
      <p style="margin:6px 0 0;font-size:14px;color:#1c1917"><strong>"${esc(keyword)}"</strong> moved from <strong>#${rankFrom}</strong> → <strong>#${rankTo}</strong> on Google</p>
      <p style="margin:4px 0 0;font-size:12px;color:#78716c">Organic impressions up this week. Keep adding quality listings to hold the gain.</p>
    </div>

    <!-- Activity bullets -->
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:16px">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0f172a">This Week on Motokah</p>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:1.8">
        <li><strong>${newListings}</strong> new car listings added</li>
        <li><strong>${wishlistAdd}</strong> listings saved to wishlists by buyers</li>
        <li>Top traffic city: <strong>${topCity}</strong></li>
        <li>Mobile traffic share up <strong>${mobileChg}%</strong></li>
        <li>Bounce rate: <strong>${bounce}%</strong> (industry avg ~65%)</li>
      </ul>
    </div>

    <div style="text-align:center;margin:20px 24px 0">
      <a href="https://www.motokah.com/admin" style="display:inline-block;background:#0284c7;color:#ffffff;font-size:14px;font-weight:700;padding:13px 32px;border-radius:8px;text-decoration:none;letter-spacing:.2px">Open Admin Dashboard →</a>
    </div>
  </div>
  <div style="background:#f1f5f9;padding:16px 24px;border-radius:0 0 12px 12px;text-align:center">
    <p style="margin:0;font-size:11px;color:#94a3b8">Motokah Marketplace &bull; Weekly analytics &bull; <a href="https://www.motokah.com/admin" style="color:#0284c7;text-decoration:none">Open Dashboard</a></p>
  </div>
</div>`;

  return { subject, html };
}

function generateEvent(forcedType) {
  // 60% listing, 25% signup, 15% analytics — natural activity mix
  const r = Math.random();
  const type = forcedType || (r < 0.60 ? "listing" : r < 0.85 ? "signup" : "analytics");
  if (type === "listing")   return generateListingEvent();
  if (type === "analytics") return buildAnalyticsEmail();
  return generateSignupEvent();
}

// ── HTTP send ─────────────────────────────────────────────────────────────────

async function sendEmail(subject, html) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ to_email: ADMIN_INBOX, subject, html }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.sent) throw new Error(`HTTP ${res.status}: ${JSON.stringify(body)}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const countArg = args[args.indexOf("--count") + 1];
const typeArg  = args[args.indexOf("--type") + 1] || null;   // "listing" | "signup" | null

// Default when called by cron: 1-3 events, looks like a natural trickle
const count = countArg ? parseInt(countArg, 10) : ri(1, 3);

console.log(`Sending ${count} event${count === 1 ? "" : "s"} (${typeArg || "mixed"}) to ${ADMIN_INBOX}…\n`);

let sent = 0;
for (let i = 0; i < count; i++) {
  const { subject, html } = generateEvent(typeArg);
  try {
    await sendEmail(subject, html);
    const type = subject.startsWith("New Listing") ? "listing" : subject.startsWith("New User") ? "signup" : "analytics";
    console.log(`✓ [${i + 1}/${count}] [${type}] ${subject.replace(/^(New Listing Pending Approval|New User Registered on Motokah): /, "")}`);
    sent++;
  } catch (err) {
    console.error(`✗ [${i + 1}/${count}] ${err.message}`);
  }
  if (i < count - 1) await new Promise(r => setTimeout(r, 400));
}

console.log(`\nDone. ${sent}/${count} sent.`);
