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
  const { title, price, currency, city, condition, color, seller } = listing;
  return {
    subject: `New Listing Pending Approval: ${title}`,
    html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
  <div style="background:#0284c7;padding:20px 24px;color:#fff">
    <h1 style="margin:0;font-size:20px;font-weight:700">New Vehicle Ad Awaiting Review</h1>
    <p style="margin:4px 0 0;font-size:13px;opacity:.9">Motokah Marketplace Admin Alert</p>
  </div>
  <div style="padding:24px">
    <p style="font-size:15px;color:#111827;margin-top:0">A seller just posted a new vehicle listing that requires admin approval before going live:</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0">
      <h3 style="margin:0 0 8px;color:#0f172a;font-size:16px">${esc(title)}</h3>
      <p style="margin:4px 0;font-size:14px;color:#0284c7;font-weight:bold">Price: ${esc(currency)} ${Number(price).toLocaleString()}</p>
      <p style="margin:4px 0;font-size:13px;color:#64748b">Location: ${esc(city)} &bull; Condition: ${esc(condition)} &bull; Colour: ${esc(color)}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0"/>
      <p style="margin:2px 0;font-size:13px;color:#334155"><strong>Seller:</strong> ${esc(seller.name)} (${esc(seller.email)})</p>
      <p style="margin:2px 0;font-size:13px;color:#334155"><strong>Phone / WhatsApp:</strong> ${esc(seller.phone)}</p>
    </div>
    <div style="text-align:center;margin:24px 0">
      <a href="https://www.motokah.com/admin/listings" style="background:#0284c7;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;display:inline-block">Review &amp; Approve Listing &rarr;</a>
    </div>
    <p style="font-size:12px;color:#94a3b8;text-align:center;margin-bottom:0">Motokah Marketplace &bull; Auto-generated notification for platform administrators</p>
  </div>
</div>`,
  };
}

function buildSignupEmail(person, city, sellerType) {
  return {
    subject: `New User Registered on Motokah: ${person.name}`,
    html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
  <div style="background:#16a34a;padding:20px 24px;color:#fff">
    <h1 style="margin:0;font-size:20px;font-weight:700">New User Registered on Motokah</h1>
    <p style="margin:4px 0 0;font-size:13px;opacity:.9">Motokah Community Growth Alert</p>
  </div>
  <div style="padding:24px">
    <p style="font-size:15px;color:#111827;margin-top:0">A new user just created an account on the Motokah platform:</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0">
      <p style="margin:4px 0;font-size:14px;color:#0f172a"><strong>Name:</strong> ${esc(person.name)}</p>
      <p style="margin:4px 0;font-size:14px;color:#0f172a"><strong>Email:</strong> ${esc(person.email)}</p>
      <p style="margin:4px 0;font-size:14px;color:#64748b"><strong>City:</strong> ${esc(city)}</p>
      <p style="margin:4px 0;font-size:14px;color:#64748b"><strong>Account Type:</strong> ${esc(sellerType)}</p>
      <p style="margin:4px 0;font-size:14px;color:#64748b"><strong>Phone:</strong> ${esc(person.phone)}</p>
    </div>
    <div style="text-align:center;margin:24px 0">
      <a href="https://www.motokah.com/admin/users" style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;display:inline-block">View User Management &rarr;</a>
    </div>
    <p style="font-size:12px;color:#94a3b8;text-align:center;margin-bottom:0">Motokah Marketplace &bull; Auto-generated notification for platform administrators</p>
  </div>
</div>`,
  };
}

// ── Event generator ───────────────────────────────────────────────────────────

function generateListingEvent() {
  const city    = pick(CITIES);
  const car     = pick(CARS);
  const year    = car.year();
  const color   = pick(COLORS);
  const seller  = fakePerson(city);
  const title   = `${year} ${car.make} ${car.model} ${car.cc}cc ${color}`;
  return buildListingEmail({ title, price: car.price(), currency: car.currency, city, condition: pick(CONDITIONS), color, seller });
}

function generateSignupEvent() {
  const city    = pick(CITIES);
  const person  = fakePerson(city);
  const type    = pick(SELLER_TYPES);
  return buildSignupEmail(person, city, type);
}

function generateEvent(forcedType) {
  // 70% listing, 30% signup — mirrors realistic marketplace activity
  const type = forcedType || (Math.random() < 0.70 ? "listing" : "signup");
  return type === "listing" ? generateListingEvent() : generateSignupEvent();
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
    const type = subject.startsWith("New Listing") ? "listing" : "signup";
    console.log(`✓ [${i + 1}/${count}] [${type}] ${subject.replace(/^(New Listing Pending Approval|New User Registered on Motokah): /, "")}`);
    sent++;
  } catch (err) {
    console.error(`✗ [${i + 1}/${count}] ${err.message}`);
  }
  if (i < count - 1) await new Promise(r => setTimeout(r, 400));
}

console.log(`\nDone. ${sent}/${count} sent.`);
