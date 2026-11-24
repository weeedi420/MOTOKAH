/**
 * sim-new-listings.mjs
 *
 * Sends fake activity notifications to motokahafrica@gmail.com to simulate
 * an active marketplace. Sends a mix of "new listing" and "new signup" emails.
 *
 * Usage:
 *   node scripts/sim-new-listings.mjs                           # 1 mixed event
 *   node scripts/sim-new-listings.mjs --count 3                 # 3 events
 *   node scripts/sim-new-listings.mjs --type signup             # signups only
 *   node scripts/sim-new-listings.mjs --type listing            # listings only
 *   node scripts/sim-new-listings.mjs --type listing-or-signup  # random mix
 *   node scripts/sim-new-listings.mjs --type analytics          # weekly report
 *   node scripts/sim-new-listings.mjs --type pending-warning    # end-of-day approval alert
 *   node scripts/sim-new-listings.mjs --skip-chance 45          # 45% chance to skip
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY    = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ADMIN_INBOX = "motokahafrica@gmail.com";

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local");
  process.exit(1);
}

// ── Country-specific name pools ───────────────────────────────────────────────
// Real, commonly used names per country — not generic pan-African lists

const NAMES_TZ = {
  first: [
    "Juma","Hassan","Rashidi","Omar","Said","Hamisi","Bakari","Ali","Khamisi","Rajabu",
    "Abdallah","Ramadhan","Iddi","Musa","Salim","Fatuma","Zainab","Amina","Mariamu",
    "Zuhura","Halima","Mwajuma","Safia","Mwanaisha","Rahma","Asha","Rukia","Pili",
    "Tatu","Rehema","Mwanajuma","Farida","Latifa","Mariam","Nuhu","Rabia","Shabani",
    "Suleiman","Yusuf","Zubeir",
  ],
  last: [
    "Juma","Hassan","Ally","Ramadhani","Kibwana","Omar","Hamisi","Chande","Bakari",
    "Khamisi","Mwamba","Rashidi","Said","Salim","Makame","Shariff","Msemo","Mtoro",
    "Amri","Mwinyi","Mbwana","Kombo","Nassoro","Seleman","Suleiman",
  ],
};

const NAMES_KE = {
  first: [
    "Kamau","John","Peter","Samuel","Francis","Moses","Patrick","David","Paul","Michael",
    "James","Robert","Thomas","Timothy","Joseph","Wanjiku","Susan","Grace","Mary","Rose",
    "Beatrice","Agnes","Elizabeth","Irene","Lucy","Ruth","Tabitha","Lydia","Eunice",
    "Priscilla","Odhiambo","Otieno","Kipchoge","Chebet","Achieng","Naliaka","Simiyu",
    "Wafula","Barasa","Jeptoo",
  ],
  last: [
    "Mwangi","Kamau","Odhiambo","Otieno","Ndirangu","Waithera","Karanja","Wambui",
    "Kimani","Gitau","Ngugi","Muriu","Njoroge","Waweru","Gatheru","Mumo","Mutua",
    "Musyoka","Kiplagat","Chebet","Achieng","Ouma","Onyango","Obiero","Simiyu","Wafula",
    "Barasa","Khisa","Namwamba","Juma",
  ],
};

const NAMES_UG = {
  first: [
    "Paul","Robert","Patrick","John","Moses","David","Michael","Samuel","Joseph","Francis",
    "Peter","Timothy","Grace","Sarah","Agnes","Mary","Lydia","Esther","Ruth","Hannah",
    "Dorcas","Priscilla","Lucy","Rose","Susan","Faridah","Mariam","Aisha","Ibrahim","Rashid",
  ],
  last: [
    "Mukasa","Namukasa","Kiggundu","Nakakande","Ssebatta","Nanteza","Opio","Akello",
    "Byamukama","Tumusiime","Kasule","Nabwire","Mutebi","Namutebi","Ayebale","Ssekandi",
    "Nsubuga","Kayiira","Lubega","Semakula","Kizza","Nankya","Mbabazi","Atim","Aber",
  ],
};

const NAMES_ETH = {
  first: [
    "Abebe","Girma","Tesfaye","Dawit","Yohannes","Ermias","Solomon","Yonas","Mulugeta",
    "Tewodros","Aster","Tigist","Mekdes","Hana","Selam","Rahel","Bethlehem","Tsehay",
    "Almaz","Meaza","Biruk","Natnael","Eyob","Henok","Kaleab",
  ],
  last: [
    "Tadesse","Haile","Bekele","Worku","Tesfaye","Alemu","Kebede","Mekonnen","Girma",
    "Desta","Negash","Wolde","Abebe","Gebre","Tekle","Ayele","Lemma","Teferi","Assefa",
    "Demeke","Kassa","Mamo","Tsegay","Berhe","Hagos",
  ],
};

const CITY_COUNTRY = {
  "Dar es Salaam": "Tanzania", "Arusha": "Tanzania", "Mwanza": "Tanzania",
  "Dodoma": "Tanzania",        "Zanzibar": "Tanzania", "Moshi": "Tanzania",
  "Nairobi": "Kenya",          "Mombasa": "Kenya",    "Kisumu": "Kenya", "Nakuru": "Kenya",
  "Kampala": "Uganda",         "Jinja": "Uganda",     "Entebbe": "Uganda",
  "Addis Ababa": "Ethiopia",
};

const CITIES = [
  // Tanzania (primary market — highest weight)
  "Dar es Salaam","Dar es Salaam","Dar es Salaam","Dar es Salaam",
  "Arusha","Arusha","Mwanza","Dodoma","Zanzibar","Moshi",
  // Kenya
  "Nairobi","Nairobi","Nairobi","Mombasa","Mombasa","Kisumu","Nakuru",
  // Uganda
  "Kampala","Kampala","Jinja","Entebbe",
  // Ethiopia
  "Addis Ababa",
];

// Prices in USD — converted to local currency at generate time
const CARS = [
  { make:"Toyota",        model:"IST",                cc:1300, usd:()=>ri(3_200,6_800),  year:()=>ri(2010,2018) },
  { make:"Toyota",        model:"Vitz",               cc:1000, usd:()=>ri(3_000,7_000),  year:()=>ri(2010,2019) },
  { make:"Toyota",        model:"Fielder",            cc:1500, usd:()=>ri(5_500,11_000), year:()=>ri(2012,2020) },
  { make:"Toyota",        model:"Harrier",            cc:2000, usd:()=>ri(10_000,24_000),year:()=>ri(2010,2017) },
  { make:"Toyota",        model:"Land Cruiser Prado", cc:2700, usd:()=>ri(26_000,46_000),year:()=>ri(2008,2016) },
  { make:"Toyota",        model:"Probox",             cc:1300, usd:()=>ri(2_800,6_500),  year:()=>ri(2008,2018) },
  { make:"Toyota",        model:"Sienta",             cc:1500, usd:()=>ri(5_500,11_000), year:()=>ri(2012,2020) },
  { make:"Toyota",        model:"Wish",               cc:1800, usd:()=>ri(4_500,9_000),  year:()=>ri(2008,2016) },
  { make:"Toyota",        model:"Premio",             cc:1800, usd:()=>ri(5_500,12_000), year:()=>ri(2010,2018) },
  { make:"Toyota",        model:"Allion",             cc:1800, usd:()=>ri(5_000,11_000), year:()=>ri(2010,2018) },
  { make:"Mazda",         model:"Demio",              cc:1300, usd:()=>ri(2_800,6_500),  year:()=>ri(2010,2019) },
  { make:"Mazda",         model:"Atenza",             cc:2000, usd:()=>ri(6_000,12_000), year:()=>ri(2010,2017) },
  { make:"Mazda",         model:"CX-5",               cc:2000, usd:()=>ri(11_000,22_000),year:()=>ri(2012,2019) },
  { make:"Nissan",        model:"Note",               cc:1200, usd:()=>ri(3_200,6_500),  year:()=>ri(2010,2019) },
  { make:"Nissan",        model:"X-Trail",            cc:2000, usd:()=>ri(7_500,18_000), year:()=>ri(2008,2017) },
  { make:"Nissan",        model:"Tiida",              cc:1500, usd:()=>ri(3_000,6_500),  year:()=>ri(2008,2015) },
  { make:"Subaru",        model:"Forester",           cc:2000, usd:()=>ri(8_000,18_000), year:()=>ri(2010,2018) },
  { make:"Subaru",        model:"Outback",            cc:2500, usd:()=>ri(9_000,20_000), year:()=>ri(2010,2018) },
  { make:"Honda",         model:"Fit",                cc:1300, usd:()=>ri(3_000,7_000),  year:()=>ri(2010,2019) },
  { make:"Honda",         model:"Freed",              cc:1500, usd:()=>ri(5_000,10_000), year:()=>ri(2010,2018) },
  { make:"Mitsubishi",    model:"Outlander",          cc:2000, usd:()=>ri(7_500,18_000), year:()=>ri(2008,2017) },
  { make:"Mitsubishi",    model:"RVR",                cc:1800, usd:()=>ri(6_000,12_000), year:()=>ri(2010,2018) },
  { make:"Mercedes-Benz", model:"C200",               cc:2000, usd:()=>ri(10_000,22_000),year:()=>ri(2008,2016) },
];

// Exchange rates (USD → local, approximate 2026 market)
const FX = {
  Tanzania: { currency: "TZS", rate: 2700, round: 500_000 },
  Kenya:    { currency: "KES", rate: 130,  round: 50_000  },
  Uganda:   { currency: "UGX", rate: 3800, round: 2_000_000 },
  Ethiopia: { currency: "ETB", rate: 60,   round: 50_000  },
};

function localPrice(usdAmount, country) {
  const fx     = FX[country] || FX.Tanzania;
  const raw    = usdAmount * fx.rate;
  const price  = Math.round(raw / fx.round) * fx.round || fx.round;
  return { price, currency: fx.currency };
}

const CONDITIONS   = ["Foreign Used","Foreign Used","Foreign Used","Locally Used","New"];
const COLORS       = ["White","Silver","Black","Pearl White","Grey","Blue","Maroon","Champagne","Red"];
const SELLER_TYPES = ["Private Seller","Private Seller","Dealer","Private Seller","Individual"];

// ── Helpers ───────────────────────────────────────────────────────────────────

const ri   = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr)      => arr[Math.floor(Math.random() * arr.length)];

function fakeName(city) {
  const country = CITY_COUNTRY[city] || "Tanzania";
  const pool    = country === "Kenya" ? NAMES_KE
                : country === "Uganda" ? NAMES_UG
                : country === "Ethiopia" ? NAMES_ETH
                : NAMES_TZ;
  return `${pick(pool.first)} ${pick(pool.last)}`;
}

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── Base email template ───────────────────────────────────────────────────────

function emailBase({ preheader, badge, badgeStyle, headline, subtext, cardHtml, buttonUrl, buttonText, buttonColor }) {
  const btnColor = buttonColor || "#0066cc";
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style type="text/css">
body,table,td,p,a{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
body{background-color:#eef0f3 !important;color-scheme:light only}
table{border-collapse:collapse}
img{border:0;line-height:100%;outline:none;text-decoration:none}
.preheader{display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden}
/* Force light mode in Gmail Android dark mode */
[data-ogsc] body,[data-ogsc] .body-wrap{background-color:#eef0f3 !important}
[data-ogsc] .email-card{background-color:#ffffff !important}
[data-ogsc] .card-inner{background-color:#f8fafc !important}
[data-ogsc] .card-footer{background-color:#f8fafc !important}
[data-ogsc] h1,[data-ogsc] .headline{color:#0f172a !important}
[data-ogsc] p,[data-ogsc] .body-text{color:#6b7280 !important}
[data-ogsc] .label-text{color:#9ca3af !important}
[data-ogsc] .value-text{color:#111827 !important}
[data-ogsc] .accent-bar{background-color:${btnColor} !important}
/* Apple Mail dark mode */
@media (prefers-color-scheme: dark) {
  body{background-color:#eef0f3 !important}
  .email-card{background-color:#ffffff !important}
  .card-inner{background-color:#f8fafc !important}
  .card-footer{background-color:#f8fafc !important}
  h1,.headline{color:#0f172a !important}
  .body-text{color:#6b7280 !important}
  .label-text{color:#9ca3af !important}
  .value-text{color:#111827 !important}
}
@media only screen and (max-width:620px){
  .wrapper{width:100%!important}
  .content-cell{padding:24px 20px!important}
}
</style>
</head>
<body bgcolor="#eef0f3">
<span class="preheader">${esc(preheader)}</span>
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef0f3">
<tr><td align="center" style="padding:28px 16px 40px">

  <table class="wrapper" width="560" cellpadding="0" cellspacing="0" style="max-width:560px">
  <tr><td align="center" style="padding:0 0 18px">
    <a href="https://www.motokah.com" style="text-decoration:none">
      <span style="font-size:22px;font-weight:900;color:#0066cc;letter-spacing:4px;text-transform:uppercase;font-family:Georgia,'Times New Roman',serif">MOTOKAH</span>
    </a>
  </td></tr>
  </table>

  <table class="wrapper email-card" width="560" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:560px;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;background-color:#ffffff">
    <tr><td class="accent-bar" bgcolor="${btnColor}" height="4" style="background-color:${btnColor};font-size:0;line-height:0;mso-line-height-rule:exactly">&nbsp;</td></tr>
    <tr><td class="content-cell" style="padding:32px 36px 28px;background-color:#ffffff">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="${badgeStyle};font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;padding:5px 12px;border-radius:4px">${esc(badge)}</td>
      </tr></table>
      <h1 class="headline" style="margin:18px 0 6px;font-size:21px;font-weight:800;color:#0f172a;line-height:1.3">${headline}</h1>
      <p class="body-text" style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6">${subtext}</p>
      <table class="card-inner" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="border-radius:8px;border:1px solid #e5e7eb;background-color:#f8fafc">
      <tr><td style="padding:20px 22px">${cardHtml}</td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
      <tr><td align="center">
        <a href="${buttonUrl}" style="background-color:${btnColor};border-top:13px solid ${btnColor};border-bottom:13px solid ${btnColor};border-left:28px solid ${btnColor};border-right:28px solid ${btnColor};border-radius:6px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;letter-spacing:.2px">${esc(buttonText)}</a>
      </td></tr>
      </table>
    </td></tr>
    <tr><td class="card-footer" bgcolor="#f8fafc" style="padding:14px 36px;border-top:1px solid #e5e7eb;background-color:#f8fafc">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">Motokah Admin &bull; <a href="https://www.motokah.com/admin" style="color:#6b7280;text-decoration:none">Open Dashboard</a></p>
    </td></tr>
  </table>

  <table class="wrapper" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;margin-top:20px">
  <tr><td align="center">
    <p style="margin:0;font-size:12px;color:#9ca3af"><a href="https://www.motokah.com" style="color:#9ca3af;text-decoration:none">motokah.com</a> &bull; East Africa's Car Marketplace</p>
  </td></tr>
  </table>

</td></tr>
</table>
</body>
</html>`;
}

// ── Email builders ────────────────────────────────────────────────────────────

function buildListingEmail(listing) {
  const { price, currency, city, condition, color, mileage, year, make, model, cc } = listing;
  const cardHtml = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" valign="top">
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin:0 0 3px">Make &amp; Model</p>
          <p style="font-size:15px;color:#111827;font-weight:700;margin:0">${esc(make)} ${esc(model)}</p>
          <p style="font-size:13px;color:#6b7280;margin:2px 0 0">${esc(year)} &bull; ${cc}cc &bull; ${esc(color)}</p>
        </td>
        <td width="50%" valign="top" align="right">
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin:0 0 3px">Asking Price</p>
          <p style="font-size:19px;color:#0066cc;font-weight:800;margin:0">${esc(currency)} ${Number(price).toLocaleString()}</p>
        </td>
      </tr>
      <tr><td colspan="2" style="padding:14px 0 0"><div style="height:1px;background-color:#e5e7eb;font-size:0;line-height:0">&nbsp;</div></td></tr>
      <tr>
        <td style="padding-top:14px">
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin:0 0 3px">Location</p>
          <p style="font-size:14px;color:#374151;font-weight:600;margin:0">${esc(city)}</p>
        </td>
        <td style="padding-top:14px" align="right">
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin:0 0 3px">Mileage</p>
          <p style="font-size:14px;color:#374151;font-weight:600;margin:0">${Number(mileage).toLocaleString()} km</p>
        </td>
      </tr>
      <tr><td colspan="2" style="padding:12px 0 0"><div style="height:1px;background-color:#e5e7eb;font-size:0;line-height:0">&nbsp;</div></td></tr>
      <tr>
        <td style="padding-top:12px">
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin:0 0 3px">Condition</p>
          <p style="font-size:14px;color:#374151;font-weight:600;margin:0">${esc(condition)}</p>
        </td>
        <td style="padding-top:12px" align="right">
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin:0 0 3px">Source</p>
          <p style="font-size:13px;color:#374151;font-weight:600;margin:0">Organic</p>
          <p style="font-size:11px;color:#9ca3af;margin:2px 0 0">Found through Google</p>
        </td>
      </tr>
    </table>`;
  return {
    subject: `New listing pending review: ${year} ${make} ${model}`,
    html: emailBase({
      preheader: `${year} ${make} ${model} from ${city} — needs your approval before going live`,
      badge: "New Listing",
      badgeStyle: "background-color:#dcfce7;color:#15803d",
      headline: `${esc(year)} ${esc(make)} ${esc(model)}`,
      subtext: "A new vehicle listing has been submitted and is waiting for admin approval before going live.",
      cardHtml,
      buttonUrl: "https://www.motokah.com/admin/listings",
      buttonText: "Review & Approve Listing →",
    }),
  };
}

function buildSignupEmail(name, city, sellerType) {
  const typeLabel = sellerType === "Dealer" ? "Dealer" : "Private Seller";
  const isDealer  = sellerType === "Dealer";
  const cardHtml = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" valign="top">
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin:0 0 3px">Name</p>
          <p style="font-size:16px;color:#111827;font-weight:700;margin:0">${esc(name)}</p>
        </td>
        <td width="50%" valign="top" align="right">
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin:0 0 3px">Account Type</p>
          <p style="font-size:14px;font-weight:700;margin:0;color:${isDealer ? "#0066cc" : "#374151"}">${esc(typeLabel)}</p>
        </td>
      </tr>
      <tr><td colspan="2" style="padding:14px 0 0"><div style="height:1px;background-color:#e5e7eb;font-size:0;line-height:0">&nbsp;</div></td></tr>
      <tr>
        <td style="padding-top:14px">
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin:0 0 3px">Location</p>
          <p style="font-size:14px;color:#374151;font-weight:600;margin:0">${esc(city)}</p>
        </td>
        <td style="padding-top:14px" align="right">
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600;margin:0 0 3px">Source</p>
          <p style="font-size:13px;color:#374151;font-weight:600;margin:0">Organic</p>
          <p style="font-size:11px;color:#9ca3af;margin:2px 0 0">Found through Google</p>
        </td>
      </tr>
    </table>`;
  return {
    subject: `New member on Motokah: ${name} — ${city}`,
    html: emailBase({
      preheader: `${name} (${typeLabel}) just created an account on Motokah from ${city}`,
      badge: "New Member",
      badgeStyle: "background-color:#dbeafe;color:#1d4ed8",
      headline: `${esc(name)} just joined Motokah`,
      subtext: "A new user has created an account on the platform.",
      cardHtml,
      buttonUrl: "https://www.motokah.com/admin/users",
      buttonText: "View All Users →",
    }),
  };
}

function buildPendingWarningEmail() {
  const count      = ri(2, 6);
  const avgHours   = (Math.random() * 6 + 2).toFixed(1);

  // Generate N simulated pending listings
  const pending = [];
  for (let i = 0; i < count; i++) {
    const car     = pick(CARS);
    const year    = car.year();
    const city    = pick(CITIES);
    const hrsAgo  = ri(2, 8);
    const minsAgo = ri(5, 59);
    pending.push({ label: `${year} ${car.make} ${car.model}`, city, hrsAgo, minsAgo });
  }

  const rows = pending.map((p, idx) => `
      <tr>
        <td style="padding:11px 0;${idx < pending.length - 1 ? "border-bottom:1px solid #fecaca" : ""}">
          <p style="margin:0;font-size:14px;color:#111827;font-weight:600">${esc(p.label)}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#9ca3af">${esc(p.city)}</p>
        </td>
        <td align="right" style="padding:11px 0;${idx < pending.length - 1 ? "border-bottom:1px solid #fecaca" : ""}">
          <p style="margin:0;font-size:13px;color:#dc2626;font-weight:700">${p.hrsAgo}h ${p.minsAgo}m ago</p>
        </td>
      </tr>`).join("");

  const cardHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#fef2f2" style="border:1px solid #fecaca;border-radius:8px;margin-bottom:16px">
      <tr><td style="padding:14px 16px">
        <p style="margin:0 0 3px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:.5px">Approval Target</p>
        <p style="margin:0;font-size:14px;color:#dc2626;font-weight:600">Under 5 minutes &bull; Current avg: ${avgHours} hours</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom:8px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600">Vehicle</td>
        <td align="right" style="padding-bottom:8px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;font-weight:600">Waiting</td>
      </tr>
      ${rows}
    </table>`;

  return {
    subject: `⚠ ${count} listing${count === 1 ? "" : "s"} pending approval — sellers are waiting`,
    html: emailBase({
      preheader: `${count} car listing${count === 1 ? "" : "s"} submitted today still need admin approval — buyer confidence at risk`,
      badge: "Action Required",
      badgeStyle: "background-color:#fef2f2;color:#dc2626",
      headline: `${count} listing${count === 1 ? "" : "s"} need your approval`,
      subtext: `These vehicles were submitted today and are still awaiting review. Sellers are waiting — every hour of delay risks losing their confidence in the platform and may push buyers to competitors.`,
      cardHtml,
      buttonUrl: "https://www.motokah.com/admin/listings",
      buttonText: "Review & Approve Now →",
      buttonColor: "#dc2626",
    }),
  };
}

function buildAnalyticsEmail() {
  const visitors    = ri(620, 1850);
  const prevVisit   = Math.round(visitors / (1 + (ri(8, 28) / 100)));
  const visitChg    = Math.round(((visitors - prevVisit) / prevVisit) * 100);
  const leads       = ri(4, 22);
  const wishlistAdd = ri(18, 74);
  const pageViews   = visitors * ri(2, 4) + ri(0, 300);
  const topCity     = pick(["Dar es Salaam","Nairobi","Arusha","Mombasa","Kampala"]);
  const topModel    = pick(["Toyota IST","Toyota Fielder","Toyota Vitz","Mazda Demio","Subaru Forester","Toyota Harrier","Nissan Note"]);
  const rankFrom    = ri(16, 28);
  const rankTo      = ri(2, 6);
  const keyword     = `${topModel} ${pick(["Tanzania","Kenya","for sale","price"])}`;
  const newListings = ri(3, 18);
  const mobileChg   = ri(4, 19);
  const bounce      = ri(44, 68);
  const now         = new Date();
  const weekEnd     = now.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
  const weekStart   = new Date(now - 7 * 86400000).toLocaleDateString("en-GB", { day:"numeric", month:"short" });

  const cardHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
      <tr>
        <td width="32%" style="padding-right:5px" valign="top">
          <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f7ff" style="border:1px solid #bfdbfe;border-radius:8px">
            <tr><td style="padding:14px;text-align:center">
              <p style="margin:0;font-size:22px;font-weight:800;color:#0066cc;line-height:1">${visitors.toLocaleString()}</p>
              <p style="margin:5px 0 0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px">Visitors</p>
              <p style="margin:3px 0 0;font-size:11px;color:#16a34a;font-weight:700">+${visitChg}%</p>
            </td></tr>
          </table>
        </td>
        <td width="32%" style="padding:0 3px" valign="top">
          <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0fdf4" style="border:1px solid #bbf7d0;border-radius:8px">
            <tr><td style="padding:14px;text-align:center">
              <p style="margin:0;font-size:22px;font-weight:800;color:#16a34a;line-height:1">${leads}</p>
              <p style="margin:5px 0 0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px">Buyer Leads</p>
              <p style="margin:3px 0 0;font-size:11px;color:#0066cc;font-weight:700">${leads > 10 ? "Strong week" : "Growing"}</p>
            </td></tr>
          </table>
        </td>
        <td width="32%" style="padding-left:5px" valign="top">
          <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f9fafb" style="border:1px solid #e5e7eb;border-radius:8px">
            <tr><td style="padding:14px;text-align:center">
              <p style="margin:0;font-size:22px;font-weight:800;color:#111827;line-height:1">${pageViews.toLocaleString()}</p>
              <p style="margin:5px 0 0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px">Page Views</p>
              <p style="margin:3px 0 0;font-size:11px;color:#6b7280;font-weight:700">${(pageViews / visitors).toFixed(1)}/visit</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
    <div style="height:1px;background-color:#e5e7eb;margin-bottom:16px"></div>
    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#fffbeb" style="border:1px solid #fde68a;border-radius:8px;margin-bottom:14px">
      <tr><td style="padding:14px 16px">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.5px">Google Ranking Update</p>
        <p style="margin:0 0 3px;font-size:14px;color:#111827;font-weight:600">"${esc(keyword)}"</p>
        <p style="margin:0;font-size:13px;color:#374151">Position <strong>#${rankFrom}</strong> moved to <strong>#${rankTo}</strong> this week</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#6b7280;font-weight:500">New listings</td>
        <td align="right" style="padding:5px 0;font-size:13px;font-weight:700;color:#111827">${newListings}</td>
      </tr>
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#6b7280;font-weight:500">Wishlist saves</td>
        <td align="right" style="padding:5px 0;font-size:13px;font-weight:700;color:#111827">${wishlistAdd}</td>
      </tr>
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#6b7280;font-weight:500">Top city</td>
        <td align="right" style="padding:5px 0;font-size:13px;font-weight:700;color:#111827">${topCity}</td>
      </tr>
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#6b7280;font-weight:500">Mobile traffic</td>
        <td align="right" style="padding:5px 0;font-size:13px;font-weight:700;color:#16a34a">+${mobileChg}%</td>
      </tr>
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#6b7280;font-weight:500">Bounce rate</td>
        <td align="right" style="padding:5px 0;font-size:13px;font-weight:700;color:#111827">${bounce}%</td>
      </tr>
    </table>`;

  return {
    subject: `Motokah Weekly Report — ${weekStart}–${weekEnd}`,
    html: emailBase({
      preheader: `${visitors.toLocaleString()} visitors, ${leads} buyer leads, ${newListings} new listings — ${weekStart}–${weekEnd}`,
      badge: "Weekly Report",
      badgeStyle: "background-color:#f0f7ff;color:#1d4ed8",
      headline: `${weekStart} – ${weekEnd}`,
      subtext: "Here's how Motokah performed this week across East Africa.",
      cardHtml,
      buttonUrl: "https://www.motokah.com/admin",
      buttonText: "Open Admin Dashboard →",
    }),
  };
}

// ── Event generator ───────────────────────────────────────────────────────────

function generateListingEvent() {
  const city              = pick(CITIES);
  const country           = CITY_COUNTRY[city] || "Tanzania";
  const car               = pick(CARS);
  const year              = car.year();
  const color             = pick(COLORS);
  const mileage           = ri(18_000, 140_000);
  const { price, currency } = localPrice(car.usd(), country);
  return buildListingEmail({ price, currency, city, condition: pick(CONDITIONS), color, mileage, year, make: car.make, model: car.model, cc: car.cc });
}

function generateSignupEvent() {
  const city = pick(CITIES);
  const name = fakeName(city);
  const type = pick(SELLER_TYPES);
  return buildSignupEmail(name, city, type);
}

function generateEvent(forcedType) {
  const r = Math.random();
  let type;
  if (forcedType === "listing-or-signup") {
    type = r < 0.60 ? "listing" : "signup";
  } else {
    type = forcedType || (r < 0.60 ? "listing" : r < 0.85 ? "signup" : "analytics");
  }
  if (type === "listing")         return generateListingEvent();
  if (type === "signup")          return generateSignupEvent();
  if (type === "analytics")       return buildAnalyticsEmail();
  if (type === "pending-warning") return buildPendingWarningEmail();
  return generateListingEvent();
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

const args          = process.argv.slice(2);
const countArg      = args[args.indexOf("--count") + 1];
const typeArg       = args[args.indexOf("--type") + 1] || null;
const skipChanceArg = args[args.indexOf("--skip-chance") + 1];
const skipChance    = skipChanceArg ? parseInt(skipChanceArg, 10) : 0;

if (skipChance > 0 && Math.random() * 100 < skipChance) {
  console.log("Skipped (random quiet slot). No email sent.");
  process.exit(0);
}

const count = countArg ? parseInt(countArg, 10) : 1;
console.log(`Sending ${count} event${count === 1 ? "" : "s"} (${typeArg || "mixed"}) to ${ADMIN_INBOX}…\n`);

let sent = 0;
for (let i = 0; i < count; i++) {
  const { subject, html } = generateEvent(typeArg);
  try {
    await sendEmail(subject, html);
    console.log(`✓ [${i + 1}/${count}] ${subject}`);
    sent++;
  } catch (err) {
    console.error(`✗ [${i + 1}/${count}] ${err.message}`);
  }
  if (i < count - 1) await new Promise(r => setTimeout(r, 400));
}

console.log(`\nDone. ${sent}/${count} sent.`);
