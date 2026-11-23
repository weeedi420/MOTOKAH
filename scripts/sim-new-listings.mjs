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

/**
 * Force light-mode in all major email clients:
 * - Apple Mail / iOS: <meta name="color-scheme" content="light">
 * - Outlook: color-scheme CSS on :root
 * - Gmail dark mode: !important on all background-color inline styles
 */
function wrapEmail(bodyHtml) {
  const forced = bodyHtml
    .replace(/background:(#[0-9a-fA-F]{3,8})\b/g, "background-color:$1 !important")
    .replace(/color:(#[0-9a-fA-F]{3,8})\b/g, "color:$1 !important");
  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style>
:root { color-scheme: light only; }
body { margin:0; padding:0; background-color:#f4f6f8 !important; }
@media (prefers-color-scheme: dark) {
  body { background-color:#f4f6f8 !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8 !important">
${forced}
</body>
</html>`;
}

function buildListingEmail(listing) {
  const { title, price, currency, city, condition, color, mileage, year, make, model, cc } = listing;
  return {
    subject: `New listing pending review: ${year} ${make} ${model}`,
    html: wrapEmail(`
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:580px;margin:0 auto;background:#f4f6f8">
  <div style="background:#ffffff;border-radius:0;padding:20px 28px 16px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle">
        <span style="display:inline-block;width:32px;height:32px;background:#0066cc;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:900;color:#fff;vertical-align:middle">M</span>
        <span style="margin-left:8px;font-size:18px;font-weight:900;color:#0066cc;letter-spacing:1px;vertical-align:middle">MOTOKAH</span>
      </td>
    </tr></table>
    <div style="border-bottom:2px solid #0066cc;margin-top:14px"></div>
  </div>

  <div style="background:#ffffff;padding:24px 28px 0">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#16a34a;letter-spacing:.8px;text-transform:uppercase">✓ NEW LISTING SUBMITTED</p>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;line-height:1.3">${esc(year)} ${esc(make)} ${esc(model)} — pending your approval</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280">A new vehicle ad has been submitted on Motokah and is waiting for admin review before going live.</p>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:20px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:12px">
            <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px">Make &amp; Model</span><br>
            <span style="font-size:16px;font-weight:700;color:#111827">${esc(make)} ${esc(model)} ${esc(year)}</span>
          </td>
          <td align="right" style="padding-bottom:12px">
            <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px">Asking Price</span><br>
            <span style="font-size:16px;font-weight:700;color:#0066cc">${esc(currency)} ${Number(price).toLocaleString()}</span>
          </td>
        </tr>
        <tr><td colspan="2"><div style="border-top:1px solid #e5e7eb;margin-bottom:12px"></div></td></tr>
        <tr>
          <td><span style="font-size:12px;color:#6b7280">📍 ${esc(city)}</span></td>
          <td align="right"><span style="font-size:12px;color:#6b7280">🛣 ${Number(mileage).toLocaleString()} km</span></td>
        </tr>
        <tr>
          <td style="padding-top:6px"><span style="font-size:12px;color:#6b7280">⚙️ ${cc}cc &bull; ${esc(color)}</span></td>
          <td align="right" style="padding-top:6px"><span style="font-size:12px;color:#6b7280">🏷 ${esc(condition)}</span></td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;padding-bottom:28px">
      <a href="https://www.motokah.com/admin/listings" style="display:inline-block;background:#0066cc;color:#ffffff;font-size:14px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none">Review &amp; Approve Listing →</a>
    </div>
  </div>

  <div style="background:#111827;padding:16px 28px;border-radius:0 0 4px 4px;text-align:center">
    <p style="margin:0 0 2px;font-size:13px;color:#ffffff;font-weight:600">Motokah Admin Notifications</p>
    <p style="margin:0;font-size:11px;color:#9ca3af">You're receiving this because you are an admin on <a href="https://www.motokah.com" style="color:#60a5fa;text-decoration:none">motokah.com</a></p>
  </div>
</div>`),
  };
}

function buildSignupEmail(person, city, sellerType) {
  const typeLabel = sellerType === "Dealer" ? "Dealer" : "Private Seller";
  return {
    subject: `New member on Motokah: ${person.name} — ${city}`,
    html: wrapEmail(`
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:580px;margin:0 auto;background:#f4f6f8">
  <div style="background:#ffffff;padding:20px 28px 16px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle">
        <span style="display:inline-block;width:32px;height:32px;background:#0066cc;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:900;color:#fff;vertical-align:middle">M</span>
        <span style="margin-left:8px;font-size:18px;font-weight:900;color:#0066cc;letter-spacing:1px;vertical-align:middle">MOTOKAH</span>
      </td>
    </tr></table>
    <div style="border-bottom:2px solid #0066cc;margin-top:14px"></div>
  </div>

  <div style="background:#ffffff;padding:24px 28px 0">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#0066cc;letter-spacing:.8px;text-transform:uppercase">● NEW MEMBER</p>
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;line-height:1.3">${esc(person.name)} just joined Motokah</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280">A new user created an account on the platform.</p>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:20px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:12px">
            <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px">Name</span><br>
            <span style="font-size:16px;font-weight:700;color:#111827">${esc(person.name)}</span>
          </td>
          <td align="right" style="padding-bottom:12px">
            <span style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px">Account Type</span><br>
            <span style="font-size:16px;font-weight:700;color:#111827">${esc(typeLabel)}</span>
          </td>
        </tr>
        <tr><td colspan="2"><div style="border-top:1px solid #e5e7eb;margin-bottom:12px"></div></td></tr>
        <tr>
          <td colspan="2"><span style="font-size:13px;color:#6b7280">📍 ${esc(city)}</span></td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;padding-bottom:28px">
      <a href="https://www.motokah.com/admin/users" style="display:inline-block;background:#0066cc;color:#ffffff;font-size:14px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none">View All Users →</a>
    </div>
  </div>

  <div style="background:#111827;padding:16px 28px;border-radius:0 0 4px 4px;text-align:center">
    <p style="margin:0 0 2px;font-size:13px;color:#ffffff;font-weight:600">Motokah Admin Notifications</p>
    <p style="margin:0;font-size:11px;color:#9ca3af">You're receiving this because you are an admin on <a href="https://www.motokah.com" style="color:#60a5fa;text-decoration:none">motokah.com</a></p>
  </div>
</div>`),
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

  const html = wrapEmail(`
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:580px;margin:0 auto;background:#f4f6f8">
  <div style="background:#ffffff;padding:20px 28px 16px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle">
        <span style="display:inline-block;width:32px;height:32px;background:#0066cc;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:900;color:#fff;vertical-align:middle">M</span>
        <span style="margin-left:8px;font-size:18px;font-weight:900;color:#0066cc;letter-spacing:1px;vertical-align:middle">MOTOKAH</span>
      </td>
    </tr></table>
    <div style="border-bottom:2px solid #0066cc;margin-top:14px"></div>
  </div>
  <div style="background:#ffffff;padding:24px 28px 0">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#0066cc;letter-spacing:.8px;text-transform:uppercase">📊 WEEKLY PERFORMANCE REPORT</p>
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#111827">${weekStart} – ${weekEnd}</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280">Here's how Motokah performed this week across East Africa.</p>
  <div style="padding:24px">
    <!-- KPI row — use table for email client compat -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
      <tr>
        <td width="32%" style="padding-right:6px">
          <div style="background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px;text-align:center">
            <p style="margin:0;font-size:24px;font-weight:800;color:#0066cc">${visitors.toLocaleString()}</p>
            <p style="margin:4px 0 0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px">Visitors</p>
            <p style="margin:3px 0 0;font-size:11px;color:#16a34a;font-weight:600">↑ ${visitChg}%</p>
          </div>
        </td>
        <td width="32%" style="padding:0 3px">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;text-align:center">
            <p style="margin:0;font-size:24px;font-weight:800;color:#16a34a">${leads}</p>
            <p style="margin:4px 0 0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px">Buyer Leads</p>
            <p style="margin:3px 0 0;font-size:11px;color:#0066cc;font-weight:600">${leads > 10 ? "Strong week" : "Growing"}</p>
          </div>
        </td>
        <td width="32%" style="padding-left:6px">
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;text-align:center">
            <p style="margin:0;font-size:24px;font-weight:800;color:#111827">${pageViews.toLocaleString()}</p>
            <p style="margin:4px 0 0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px">Page Views</p>
            <p style="margin:3px 0 0;font-size:11px;color:#6b7280;font-weight:600">avg ${(pageViews / visitors).toFixed(1)}/visit</p>
          </div>
        </td>
      </tr>
    </table>

    <!-- SEO -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.5px">🔍 Google Ranking Update</p>
      <p style="margin:0 0 4px;font-size:15px;color:#111827"><strong>"${esc(keyword)}"</strong></p>
      <p style="margin:0;font-size:14px;color:#374151">Moved from position <strong>#${rankFrom}</strong> to <strong>#${rankTo}</strong> on Google this week.</p>
    </div>

    <!-- Activity -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.5px">This week</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;font-size:13px;color:#374151">🚗 New listings</td><td align="right" style="font-size:13px;font-weight:700;color:#111827">${newListings}</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#374151">❤️ Wishlist saves</td><td align="right" style="font-size:13px;font-weight:700;color:#111827">${wishlistAdd}</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#374151">📍 Top city</td><td align="right" style="font-size:13px;font-weight:700;color:#111827">${topCity}</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#374151">📱 Mobile traffic up</td><td align="right" style="font-size:13px;font-weight:700;color:#111827">${mobileChg}%</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#374151">↩️ Bounce rate</td><td align="right" style="font-size:13px;font-weight:700;color:#111827">${bounce}%</td></tr>
      </table>
    </div>

    <div style="text-align:center;padding-bottom:28px">
      <a href="https://www.motokah.com/admin" style="display:inline-block;background:#0066cc;color:#ffffff;font-size:14px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none">Open Admin Dashboard →</a>
    </div>
  </div>

  <div style="background:#111827;padding:16px 28px;border-radius:0 0 4px 4px;text-align:center">
    <p style="margin:0 0 2px;font-size:13px;color:#ffffff;font-weight:600">Motokah Admin Notifications</p>
    <p style="margin:0;font-size:11px;color:#9ca3af">You're receiving this because you are an admin on <a href="https://www.motokah.com" style="color:#60a5fa;text-decoration:none">motokah.com</a></p>
  </div>
</div>`);

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
