/**
 * sim-new-listings.mjs
 *
 * Sends fake "new listing pending approval" notification emails to
 * motokahafrica@gmail.com to simulate marketplace activity.
 *
 * Usage:
 *   node scripts/sim-new-listings.mjs          # sends 1-20 (random daily volume)
 *   node scripts/sim-new-listings.mjs --count 3 # sends exactly 3
 *
 * Uses the Supabase send-email edge function. No auth required for
 * sending to the admin inbox (motokahafrica@gmail.com).
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

// ── Data pools ────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Amani", "Baraka", "Chidi", "Daudi", "Emmanuel", "Farida", "Grace", "Hassan",
  "Ibrahim", "Juma", "Kioni", "Lilian", "Musa", "Neema", "Omar", "Pendo",
  "Rashid", "Salma", "Tariq", "Upendo", "Valentine", "Wanjiru", "Xolani", "Yusuf",
  "Zawadi", "Abdi", "Beatrice", "Calleb", "Dorcas", "Evans", "Fatuma", "George",
  "Halima", "Ismail", "Joyce", "Kipchoge", "Leila", "Moses", "Naomi", "Ochieng",
  "Priscilla", "Qasim", "Ruth", "Samuel", "Tabitha", "Uwimana", "Victor", "Wambua",
  "Amara", "Boniface", "Caroline", "Dennis", "Elizabeth", "Felix", "Gloria", "Henry",
];

const LAST_NAMES = [
  "Mwangi", "Odhiambo", "Kamau", "Njoroge", "Kiplagat", "Achieng", "Omondi", "Wambua",
  "Msomi", "Makame", "Juma", "Hassan", "Salim", "Rashidi", "Musa", "Otieno",
  "Kamande", "Gatheru", "Wanjiku", "Muriu", "Gitau", "Karanja", "Ngugi", "Kimani",
  "Banda", "Phiri", "Tembo", "Mwamba", "Zulu", "Dlamini", "Nkosi", "Sithole",
  "Tankeh", "Mensah", "Asante", "Boateng", "Adjei", "Owusu", "Acheampong", "Darko",
  "Mbeki", "Nkrumah", "Addo", "Agyemang", "Obeng", "Quaye", "Sarfo", "Tetteh",
  "Waweru", "Waithaka", "Maina", "Mumo", "Mutua", "Musyoka", "Ndung'u", "Kihara",
];

const CITIES = [
  // Tanzania
  "Dar es Salaam", "Dar es Salaam", "Dar es Salaam", // weight TZ higher
  "Arusha", "Mwanza", "Dodoma", "Zanzibar", "Moshi",
  // Kenya
  "Nairobi", "Nairobi", "Mombasa", "Kisumu", "Nakuru",
  // Uganda
  "Kampala", "Kampala", "Jinja", "Entebbe",
  // Ethiopia
  "Addis Ababa",
];

const CARS = [
  // Toyota
  { make: "Toyota", model: "IST", year: () => rYear(2010, 2018), cc: 1300, price: () => rInt(6_000_000, 14_000_000), currency: "TZS" },
  { make: "Toyota", model: "Vitz", year: () => rYear(2010, 2019), cc: 1000, price: () => rInt(5_000_000, 11_000_000), currency: "TZS" },
  { make: "Toyota", model: "Fielder", year: () => rYear(2012, 2020), cc: 1500, price: () => rInt(10_000_000, 22_000_000), currency: "TZS" },
  { make: "Toyota", model: "Harrier", year: () => rYear(2010, 2017), cc: 2000, price: () => rInt(22_000_000, 50_000_000), currency: "TZS" },
  { make: "Toyota", model: "Land Cruiser Prado", year: () => rYear(2008, 2016), cc: 2700, price: () => rInt(60_000_000, 110_000_000), currency: "TZS" },
  { make: "Toyota", model: "Probox", year: () => rYear(2008, 2018), cc: 1300, price: () => rInt(6_000_000, 13_000_000), currency: "TZS" },
  { make: "Toyota", model: "Sienta", year: () => rYear(2012, 2020), cc: 1500, price: () => rInt(14_000_000, 26_000_000), currency: "TZS" },
  { make: "Toyota", model: "Wish", year: () => rYear(2008, 2016), cc: 1800, price: () => rInt(12_000_000, 22_000_000), currency: "TZS" },
  // Mazda
  { make: "Mazda", model: "Demio", year: () => rYear(2010, 2019), cc: 1300, price: () => rInt(6_000_000, 13_000_000), currency: "TZS" },
  { make: "Mazda", model: "Atenza", year: () => rYear(2010, 2017), cc: 2000, price: () => rInt(15_000_000, 28_000_000), currency: "TZS" },
  { make: "Mazda", model: "CX-5", year: () => rYear(2012, 2019), cc: 2000, price: () => rInt(28_000_000, 55_000_000), currency: "TZS" },
  // Nissan
  { make: "Nissan", model: "Note", year: () => rYear(2010, 2019), cc: 1200, price: () => rInt(7_000_000, 15_000_000), currency: "TZS" },
  { make: "Nissan", model: "X-Trail", year: () => rYear(2008, 2017), cc: 2000, price: () => rInt(18_000_000, 40_000_000), currency: "TZS" },
  { make: "Nissan", model: "Tiida", year: () => rYear(2008, 2015), cc: 1500, price: () => rInt(7_000_000, 15_000_000), currency: "TZS" },
  // Subaru
  { make: "Subaru", model: "Forester", year: () => rYear(2010, 2018), cc: 2000, price: () => rInt(20_000_000, 42_000_000), currency: "TZS" },
  { make: "Subaru", model: "Outback", year: () => rYear(2010, 2018), cc: 2500, price: () => rInt(22_000_000, 48_000_000), currency: "TZS" },
  // Mercedes-Benz
  { make: "Mercedes-Benz", model: "C200", year: () => rYear(2008, 2016), cc: 2000, price: () => rInt(25_000_000, 55_000_000), currency: "TZS" },
  // Honda
  { make: "Honda", model: "Fit", year: () => rYear(2010, 2019), cc: 1300, price: () => rInt(7_000_000, 16_000_000), currency: "TZS" },
  { make: "Honda", model: "Freed", year: () => rYear(2010, 2018), cc: 1500, price: () => rInt(12_000_000, 24_000_000), currency: "TZS" },
  // Mitsubishi
  { make: "Mitsubishi", model: "Outlander", year: () => rYear(2008, 2017), cc: 2000, price: () => rInt(18_000_000, 40_000_000), currency: "TZS" },
  { make: "Mitsubishi", model: "RVR", year: () => rYear(2010, 2018), cc: 1800, price: () => rInt(14_000_000, 28_000_000), currency: "TZS" },
];

const CONDITIONS = ["Foreign Used", "Foreign Used", "Foreign Used", "Locally Used", "New"];
const COLORS = ["White", "Silver", "Black", "Pearl White", "Grey", "Blue", "Red", "Champagne", "Maroon"];
const PHONE_PREFIXES = { "Tanzania": "+255", "Kenya": "+254", "Uganda": "+256", "Ethiopia": "+251" };
const COUNTRY_OF_CITY = {
  "Dar es Salaam": "Tanzania", "Arusha": "Tanzania", "Mwanza": "Tanzania",
  "Dodoma": "Tanzania", "Zanzibar": "Tanzania", "Moshi": "Tanzania",
  "Nairobi": "Kenya", "Mombasa": "Kenya", "Kisumu": "Kenya", "Nakuru": "Kenya",
  "Kampala": "Uganda", "Jinja": "Uganda", "Entebbe": "Uganda",
  "Addis Ababa": "Ethiopia",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function rInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rYear(min, max) { return rInt(min, max); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function fakeSeller(city) {
  const country = COUNTRY_OF_CITY[city] || "Tanzania";
  const prefix = PHONE_PREFIXES[country] || "+255";
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const local = String(rInt(700_000_000, 799_999_999));
  const phone = `${prefix} ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  // Use Gmail / Yahoo / Outlook — realistic for East Africa, not @motokah.com
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "gmail.com"];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}${rInt(10, 99)}@${pick(domains)}`;
  return { name, email, phone };
}

function fakeListingTitle(car, year, color) {
  return `${year} ${car.make} ${car.model} ${car.cc}cc ${color}`;
}

function escHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildEmailHtml(params) {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
  <div style="background: #0284c7; padding: 20px 24px; color: #ffffff;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 700;">New Vehicle Ad Awaiting Review</h1>
    <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Motokah Marketplace Admin Alert</p>
  </div>
  <div style="padding: 24px;">
    <p style="font-size: 15px; color: #111827; margin-top: 0;">
      A seller just posted a new vehicle listing that requires admin approval before going live:
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 16px;">${escHtml(params.title)}</h3>
      <p style="margin: 4px 0; font-size: 14px; color: #0284c7; font-weight: bold;">
        Price: ${escHtml(params.currency)} ${Number(params.price).toLocaleString()}
      </p>
      <p style="margin: 4px 0; font-size: 13px; color: #64748b;">
        Location: ${escHtml(params.city)} &bull; Condition: ${escHtml(params.condition)} &bull; Colour: ${escHtml(params.color)}
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 12px 0;" />
      <p style="margin: 2px 0; font-size: 13px; color: #334155;">
        <strong>Seller:</strong> ${escHtml(params.sellerName)} (${escHtml(params.sellerEmail)})
      </p>
      <p style="margin: 2px 0; font-size: 13px; color: #334155;">
        <strong>Phone / WhatsApp:</strong> ${escHtml(params.sellerPhone)}
      </p>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="https://www.motokah.com/admin/listings" style="background: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
        Review &amp; Approve Listing &rarr;
      </a>
    </div>
    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
      Motokah Marketplace &bull; Auto-generated notification for platform administrators
    </p>
  </div>
</div>`;
}

async function sendEmail(subject, html) {
  const url = `${SUPABASE_URL}/functions/v1/send-email`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ to_email: ADMIN_INBOX, subject, html }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.sent) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

function generateListing() {
  const city = pick(CITIES);
  const car = pick(CARS);
  const year = car.year();
  const color = pick(COLORS);
  const condition = pick(CONDITIONS);
  const price = car.price();
  const seller = fakeSeller(city);
  const title = fakeListingTitle(car, year, color);
  return { title, make: car.make, model: car.model, year, cc: car.cc, price, currency: car.currency, color, condition, city, seller };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const countArgIdx = args.indexOf("--count");
const count = countArgIdx !== -1 ? parseInt(args[countArgIdx + 1], 10) : rInt(1, 20);

console.log(`Sending ${count} fake listing notification${count === 1 ? "" : "s"} to ${ADMIN_INBOX}…\n`);

let sent = 0;
let failed = 0;

for (let i = 0; i < count; i++) {
  const listing = generateListing();
  const html = buildEmailHtml({
    title: listing.title,
    price: listing.price,
    currency: listing.currency,
    city: listing.city,
    condition: listing.condition,
    color: listing.color,
    sellerName: listing.seller.name,
    sellerEmail: listing.seller.email,
    sellerPhone: listing.seller.phone,
  });
  const subject = `New Listing Pending Approval: ${listing.title}`;
  try {
    await sendEmail(subject, html);
    console.log(`✓ [${i + 1}/${count}] ${listing.title} — ${listing.city} — ${listing.seller.name}`);
    sent++;
  } catch (err) {
    console.error(`✗ [${i + 1}/${count}] ${listing.title} — ${err.message}`);
    failed++;
  }
  // Small delay to avoid hammering the edge function
  if (i < count - 1) await new Promise(r => setTimeout(r, 300));
}

console.log(`\nDone. ${sent} sent, ${failed} failed.`);
