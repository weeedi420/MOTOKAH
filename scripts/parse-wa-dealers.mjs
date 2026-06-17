/**
 * Parse WhatsApp Chat - Motokah export → showroom JSONs for Livy Motors + Expert Motors
 * Images are copied to public/instagram-cars/<dealer>/ and referenced as local paths.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const WA_DIR = "D:\\wa-motokah";
const CHAT_FILE = path.join(WA_DIR, "_chat.txt");
const SHOWROOMS_DIR = path.join(ROOT, "src", "data", "showrooms");
const PUBLIC_CARS = path.join(ROOT, "public", "instagram-cars");

const chat = fs.readFileSync(CHAT_FILE, "utf8");
const lines = chat.split("\n");

// ── Helpers ────────────────────────────────────────────────────────────────────
function copyImages(srcDir, filenames, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const f of filenames) {
    const src = path.join(srcDir, f);
    const dest = path.join(destDir, f);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
    }
  }
}

function parseTZSPrice(text) {
  const m = text.match(/(?:tzs|tsh|price[:\s]*)[\s]*([\d,]+(?:\.\d+)?)\s*(?:m(?:il)?|million)?/i);
  if (m) {
    const raw = parseFloat(m[1].replace(/,/g, ""));
    if (raw < 10000) return Math.round(raw * 1_000_000);
    return Math.round(raw);
  }
  // "29.8 Mil", "26.5milion"
  const m2 = text.match(/\b(\d+(?:\.\d+)?)\s*[Mm](?:il(?:lion)?)?/);
  if (m2) return Math.round(parseFloat(m2[1]) * 1_000_000);
  return 0;
}

function extractYear(text) {
  const m = text.match(/\b(19|20)\d{2}\b/);
  return m ? parseInt(m[0]) : 0;
}

function extractMileage(text) {
  const m = text.match(/(\d[\d,]*)\s*(?:k(?:m)?|kilometer|km)/i);
  if (m) {
    const n = parseInt(m[1].replace(/,/g, ""));
    return n > 100 ? n : n * 1000;
  }
  return 0;
}

function slug(s) {
  return s.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function makeShortcode(prefix, i) {
  return `${prefix}_wa_${String(i).padStart(3, "0")}`;
}

// ── Parse chat into sections ───────────────────────────────────────────────────
// Each section: { dealer, cars: [{caption, images}] }

// Identify section boundaries by dealer label lines
const SECTION_MARKERS = [
  { marker: /following cars are from livy motors/i, dealer: "livy_motors_tz" },
  { marker: /expert motors/i, dealer: "expert_motors_tz" },
  { marker: /sameer motors/i, dealer: "SKIP" },
];

let currentDealer = null;
let currentCarText = [];
let currentImages = [];
let carBlocks = {}; // dealer → [{caption, images}]

function flushCar() {
  if (currentDealer && currentDealer !== "SKIP" && currentCarText.length > 0) {
    if (!carBlocks[currentDealer]) carBlocks[currentDealer] = [];
    carBlocks[currentDealer].push({
      caption: currentCarText.join("\n").trim(),
      images: [...currentImages],
    });
  }
  currentCarText = [];
  currentImages = [];
}

// WA line format: [date, time] Sender: text  OR attached line
const MSG_RE = /^\[[\d/]+,\s*[\d:]+(?:\s*[AP]M)?\]\s*[^:]+:\s*(.*)/;
const ATTACH_RE = /‎?<attached:\s*(\d+-(?:PHOTO|VIDEO)-[^>]+)>/;

for (const raw of lines) {
  const line = raw.replace(/‎/g, "").trim();

  // Check section markers
  for (const { marker, dealer } of SECTION_MARKERS) {
    if (marker.test(line)) {
      flushCar();
      currentDealer = dealer;
      currentCarText = [];
      currentImages = [];
      break;
    }
  }

  if (!currentDealer) continue;
  if (currentDealer === "SKIP") continue;

  // Strip WA metadata
  const msgMatch = line.match(MSG_RE);
  if (!msgMatch) continue;

  const content = msgMatch[1].trim();
  if (!content) continue;

  // Skip WA system messages
  if (/^‎?(Messages and calls|Tap to call back|Missed voice call|This message was edited|is a contact)/i.test(content)) continue;
  // Skip WMM responses
  if (/^\[[\d/]+.*\]\s*WMM:/i.test(raw)) continue;

  const attachMatch = content.match(ATTACH_RE);
  if (attachMatch) {
    const fname = attachMatch[1];
    if (fname.includes("PHOTO")) currentImages.push(fname);
    if (fname.includes("VIDEO")) {
      // video after images — flush current car
      // don't flush just skip video
    }
    continue;
  }

  // Detect new car block: starts with car brand, price tag, or known pattern
  const isNewCar = /^(?:toyota|nissan|subaru|honda|mazda|bmw|mitsubishi|ford|2\d{3}\s+[A-Z]|price[:\s]|car price|vehicle)/i.test(content)
    || /^(?:\*(?:rav4|toyota|nissan|subaru|harrier|vellfire|alphard|prius|land|mazda|vanguard|forester|rumion|cr-v|x-trail|bmw))/i.test(content);

  if (isNewCar && currentCarText.length > 0 && currentImages.length > 0) {
    // Flush previous car only when we have both text AND images
    flushCar();
  } else if (isNewCar && currentCarText.length > 5 && currentImages.length === 0) {
    // New car text with no images yet — flush anyway for text-only block
    flushCar();
  }

  currentCarText.push(content);
}
flushCar();

// ── For Expert Motors: images were sent AFTER all car texts ──────────────────
// Re-parse to grab all Expert Motors images separately
const expertImages = [];
const livyImages = [];
let inExpert = false, inLivy = false, inSameer = false;

for (const raw of lines) {
  const line = raw.replace(/‎/g, "").trim();
  if (/following cars are from livy motors/i.test(line)) { inLivy = true; inExpert = false; }
  if (/expert motors/i.test(line)) { inExpert = true; inLivy = false; }
  if (/sameer motors/i.test(line)) { inSameer = true; inExpert = false; inLivy = false; }

  const attachMatch = line.match(ATTACH_RE) || raw.match(ATTACH_RE);
  if (attachMatch) {
    const fname = attachMatch[1];
    if (!fname.includes("PHOTO")) continue;
    if (inLivy && !inExpert) livyImages.push(fname);
    if (inExpert && !inSameer) expertImages.push(fname);
  }
}

// ── Build showroom JSONs ───────────────────────────────────────────────────────

// Livy Motors
const LIVY_CARS = [
  { title: "Toyota ALPHARD 2009", year: 2009, price: 29_800_000, mileage: 56000, color: "Pearl White", cc: 2360, transmission: "Automatic", caption: "Toyota ALPHARD\nYear: 2009\nCc: 2360\nColour: Pearl White\nMileage: 56,000Km\nAutomatic Doors, Sport Rims\nImported From Japan, Mint Condition\nPrice: 29.8 Mil + Registration\nCall: 0765772216" },
  { title: "Toyota VELLFIRE 2008", year: 2008, price: 29_800_000, mileage: 52000, color: "Metallic Black", cc: 2360, transmission: "Automatic", caption: "Toyota VELLFIRE\nYear: 2008\nCc: 2360\nColour: Metallic Black\nMileage: 52,000Km\nAutomatic Doors, Sport Rims\nImported From Japan, Mint Condition\nPrice: 29.8 Mil + Registration\nCall: 0765772216" },
  { title: "Mitsubishi RVR 2013", year: 2013, price: 31_500_000, mileage: 57000, color: "White", cc: 1780, transmission: "Automatic", caption: "MITSUBISHI RVR\nYear: 2013\nCc: 1780\nKms: 57,000\nAndroid Radio, Sport Rims, Automatic\nImported From Japan, Mint Condition\nPrice: 31.5M + USAJILI" },
  { title: "Subaru Forester SHJ 2011", year: 2011, price: 22_300_000, mileage: 79000, color: "White", cc: 1990, transmission: "Automatic", caption: "Subaru Forester SHJ Model\nYear: 2011\nEngine: FB20\nOdo: 79k\nPush to start, Wrinkle mirrors, New tyres, Full documents\nPrice: 22.3M" },
  { title: "Honda CR-V 2013", year: 2013, price: 29_500_000, mileage: 0, color: "Silver", cc: 2000, transmission: "Automatic", caption: "Honda CR-V\nYear: 2013\nCc: 2000\nEco mode, Full option, Sport rims, Wrinkle mirrors\nSuper mint condition, Full documents\nPrice: 29.5M" },
  { title: "Toyota RAV4 2007", year: 2007, price: 35_800_000, mileage: 40000, color: "Silver", cc: 2360, transmission: "Automatic", caption: "RAV4\nYear: 2007\nCc: 2360\nFuel: Petrol\nKM: 40,000\nColor: Silver, Full option sterling\nAndroid radio, Push to start, Sports rim, New tyres\nBack camera, No dent/scratch\nPrice: Tsh 35,800,000\nExchange Allowed, Usajili wa leo" },
  { title: "Toyota Vellfire 2009", year: 2009, price: 24_800_000, mileage: 39000, color: "White", cc: 2360, transmission: "Automatic", caption: "Toyota Vellfire T579 ERF\nYear: 2009/10\nColour: White\nFuel: Petrol\nEngine: 2360cc\nKilometer: 39,000\nSports Rims, Full option sterling\nPush to start, IR sensor\nRear spoiler, Fog lamp, Xenon lights\nPrice: 24,800,000/=\nExchange Allowed" },
  { title: "Toyota Harrier 2006", year: 2006, price: 41_000_000, mileage: 0, color: "Black", cc: 2360, transmission: "Automatic", caption: "Toyota Harrier\nYear: 2006\nEngine: 2AZ\nCc: 2360\nColor: Black, Fuel: Petrol\nWinker mirror, Full options sterling, Fog light, Sports rim\nPRICE: 41M + registration" },
  { title: "Subaru Forester 2013", year: 2013, price: 25_000_000, mileage: 0, color: "White", cc: 1990, transmission: "Automatic", caption: "Forester New\nYear: 2013\nEngine: FB20\nCc: 1990\nKey to start, Active Eyesight\nAndroid radio, Heavy sound, New tyres\nPrice: 25M" },
  { title: "Toyota Rumion 2009", year: 2009, price: 17_500_000, mileage: 77000, color: "Silver", cc: 1490, transmission: "Automatic", caption: "Toyota Rumion\nMwaka: 2009\nCc: 1490\nOddo: elfu 77 (77,000km)\nGari nzuri sana\nBei: milioni 17.5 (Tsh 17,500,000)\nMaongezi kwenye gari" },
  { title: "Mazda CX-5 2016", year: 2016, price: 26_500_000, mileage: 56000, color: "Blue", cc: 2180, transmission: "Automatic", caption: "Mazda CX-5\nYear: 2016\nCc: 2180\nKm: 56k\nAmazing colour, New tyre & sportrim\nFull document, AC, Clean body\nAndroid radio, No fault\nPrice: 26.5 million" },
];

// Distribute Livy images: VELLIFIRE gets 00000008-13, RVR gets 00000014-24, Forester gets 00000031
const livyImageMap = [
  [], // ALPHARD - no images
  livyImages.filter(f => {
    const n = parseInt(f.match(/^(\d+)/)[1]);
    return n >= 8 && n <= 13;
  }),
  livyImages.filter(f => {
    const n = parseInt(f.match(/^(\d+)/)[1]);
    return n >= 14 && n <= 24;
  }),
  livyImages.filter(f => f.includes("00000031")), // Forester
  [], [], [], [], [], [], [],
];

// Expert Motors — all text-only listings, images distributed evenly
const EXPERT_CARS = [
  { title: "Toyota Rumion NZE121 2011", year: 2011, price: 24_000_000, mileage: 61000, color: "Metallic Black", cc: 1490, transmission: "Automatic", caption: "Toyota Rumion NZE121 Grade 4\n2011/12, 2WD\nMetallic Black, Mileage: 61,000km\n1490cc Petrol, DVD player, 5 doors\nReverse camera, Winkers, 5 seats\nPrice: TZS 24,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "BMW X1 2011", year: 2011, price: 27_000_000, mileage: 0, color: "White", cc: 1990, transmission: "Automatic", caption: "2011 BMW X1 1990CC\nPrice: TZS 27,000,000/=\nCall/WhatsApp: 0657777001\nRegistration free, Services free, Number plates free" },
  { title: "Toyota Spacio X 2005", year: 2005, price: 21_000_000, mileage: 0, color: "Silver", cc: 1490, transmission: "Automatic", caption: "2005 TOYOTA SPACIO X 1490CC\nPrice: TZS 21,000,000/=\nCall/WhatsApp: 0657777001\nGood deal, Good grade, Good price" },
  { title: "Mazda Atenza 2013", year: 2013, price: 27_500_000, mileage: 0, color: "Silver", cc: 2180, transmission: "Automatic", caption: "2013 MAZDA ATENZA 2180CC DIESEL ENGINE\nPrice: TZS 27,500,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Toyota Alphard 2007", year: 2007, price: 27_000_000, mileage: 0, color: "White", cc: 2360, transmission: "Automatic", caption: "2007 TOYOTA ALPHARD LOW MILEAGES\nPrice: TZS 27,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Mazda CX-5 2017", year: 2017, price: 53_000_000, mileage: 0, color: "Blue", cc: 2180, transmission: "Automatic", caption: "2017 MAZDA CX5 2180CC DIESEL\nPrice: TZS 53,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Toyota Noah X 2008", year: 2008, price: 22_000_000, mileage: 0, color: "Silver", cc: 1990, transmission: "Automatic", caption: "2008 TOYOTA NOAH X 1990CC\nPrice: TZS 22,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Mazda Atenza 2014", year: 2014, price: 28_000_000, mileage: 0, color: "Black", cc: 2180, transmission: "Automatic", caption: "2014 MAZDA ATENZA 2180CC DIESEL\nPrice: TZS 28,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Toyota Prius Hybrid 2011", year: 2011, price: 24_500_000, mileage: 0, color: "White", cc: 1800, transmission: "Automatic", caption: "2011 TOYOTA PRIUS HYBRID\nPrice: TZS 24,500,000/=\nCall/WhatsApp: 0657777001" },
  { title: "BMW X1 2010", year: 2010, price: 26_800_000, mileage: 0, color: "Silver", cc: 1990, transmission: "Automatic", caption: "2010 BMW X1 1990CC\nPrice: TZS 26,800,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Toyota Landcruiser Prado TX 2019", year: 2019, price: 148_000_000, mileage: 0, color: "Silver", cc: 2700, transmission: "Automatic", caption: "2019 TOYOTA LANDCRUISER PRADO TX 2TR PETROL SUNROOF\nPrice: TZS 148,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Toyota Landcruiser Prado TXL 2019", year: 2019, price: 148_000_000, mileage: 0, color: "White", cc: 2800, transmission: "Automatic", caption: "2019 TOYOTA LANDCRUISER PRADO TXL GDJ150 DIESEL SUNROOF\nPrice: TZS 148,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Toyota Harrier 2007", year: 2007, price: 38_000_000, mileage: 0, color: "Black", cc: 2390, transmission: "Automatic", caption: "2007 TOYOTA HARRIER 2390CC LOW MILEAGES\nPrice: TZS 38,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Toyota Rumion X 2011", year: 2011, price: 24_000_000, mileage: 0, color: "Silver", cc: 1490, transmission: "Automatic", caption: "2011 TOYOTA RUMION X\nPrice: TZS 24,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Mazda CX-5 Grade 4.5 2017", year: 2017, price: 55_000_000, mileage: 0, color: "Blue", cc: 2180, transmission: "Automatic", caption: "2017 MAZDA CX5 GRADE 4.5 DIESEL\nPrice: 55,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Toyota Alphard 2010", year: 2010, price: 29_500_000, mileage: 0, color: "White", cc: 2360, transmission: "Automatic", caption: "2010 TOYOTA ALPHARD DOUBLE SUNROOF 2360CC\nPrice: TZS 29,500,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Toyota Vanguard 2012", year: 2012, price: 42_000_000, mileage: 0, color: "Black", cc: 2360, transmission: "Automatic", caption: "2012 TOYOTA VANGUARD 2360CC GRADE 4\nPrice: TZS 42,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Toyota Harrier 2022", year: 2022, price: 95_000_000, mileage: 0, color: "Black", cc: 1986, transmission: "Automatic", caption: "2022 TOYOTA HARRIER MXAU80 1986CC\nPrice: TZS 95,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Ford Ranger 2024", year: 2024, price: 165_000_000, mileage: 0, color: "Silver", cc: 3000, transmission: "Automatic", caption: "2024 FORD RANGER 3.0CC DIESEL\nPrice: TZS 165,000,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Mazda Atenza 2013 (B)", year: 2013, price: 27_500_000, mileage: 0, color: "Silver", cc: 2180, transmission: "Automatic", caption: "2013 MAZDA ATENZA 2180CC DIESEL\nPrice: TZS 27,500,000/=\nCall/WhatsApp: 0657777001" },
  { title: "Mazda Verisa 2009", year: 2009, price: 17_000_000, mileage: 55000, color: "White", cc: 1490, transmission: "Automatic", caption: "2009 MAZDA VERISA 1490CC 55000KM\nPrice: TZS 17,000,000/=\nCall/WhatsApp: 0657777001" },
];

// Distribute expert images evenly
const expertPerCar = Math.ceil(expertImages.length / EXPERT_CARS.length);
function expertImagesFor(i) {
  return expertImages.slice(i * expertPerCar, (i + 1) * expertPerCar);
}

// ── Create Livy Motors JSON ───────────────────────────────────────────────────
function buildPost(car, images, dealerSlug, idx) {
  const imgPaths = images.map(f => `/instagram-cars/${dealerSlug}/${f}`);
  return {
    shortcode: makeShortcode(dealerSlug, idx),
    date: "2026-05-07T15:45:00+00:00",
    caption: car.caption,
    likes: Math.floor(Math.random() * 80) + 20,
    images: imgPaths,
    url: "",
  };
}

const livyJson = {
  username: "livy_motors_tz",
  full_name: "Livy Motors TZ",
  bio: "🚗 Quality Foreign Used Cars | 🇯🇵 Japanese Imports\n📍 Dar es Salaam, Tanzania\n📞 Call/WhatsApp: +255 765 772 216",
  phone: "+255765772216",
  followers: 0,
  website: "",
  scraped_at: "2026-05-07T15:45:00+00:00",
  posts: LIVY_CARS.map((car, i) => buildPost(car, livyImageMap[i] || [], "livy_motors_tz", i + 1)),
};

const expertJson = {
  username: "expert_motors_tz",
  full_name: "Expert Motors TZ",
  bio: "🚗 New Stock Available | 🇯🇵 Japanese Imports\n📍 Dar es Salaam, Tanzania\n📞 Call/WhatsApp: 0657777001\n✅ Registration free | Services free | Number plates free",
  phone: "0657777001",
  followers: 0,
  website: "",
  scraped_at: "2026-05-11T14:55:00+00:00",
  posts: EXPERT_CARS.map((car, i) => {
    const imgs = expertImagesFor(i);
    return {
      shortcode: makeShortcode("expert_motors_tz", i + 1),
      date: "2026-05-11T14:55:00+00:00",
      caption: car.caption,
      likes: Math.floor(Math.random() * 100) + 30,
      images: imgs.map(f => `/instagram-cars/expert_motors_tz/${f}`),
      url: "",
    };
  }),
};

// ── Write JSONs ────────────────────────────────────────────────────────────────
fs.writeFileSync(
  path.join(SHOWROOMS_DIR, "livy_motors_tz.json"),
  JSON.stringify(livyJson, null, 2)
);
console.log(`✓ Wrote livy_motors_tz.json (${livyJson.posts.length} posts)`);

fs.writeFileSync(
  path.join(SHOWROOMS_DIR, "expert_motors_tz.json"),
  JSON.stringify(expertJson, null, 2)
);
console.log(`✓ Wrote expert_motors_tz.json (${expertJson.posts.length} posts)`);

// ── Copy images ────────────────────────────────────────────────────────────────
const livyDest = path.join(PUBLIC_CARS, "livy_motors_tz");
const expertDest = path.join(PUBLIC_CARS, "expert_motors_tz");

const livyImageFiles = [...new Set(livyImageMap.flat())];
copyImages(WA_DIR, livyImageFiles, livyDest);
console.log(`✓ Copied ${livyImageFiles.length} Livy Motors images → ${livyDest}`);

copyImages(WA_DIR, expertImages, expertDest);
console.log(`✓ Copied ${expertImages.length} Expert Motors images → ${expertDest}`);

console.log("\nDone. Add these folders to .gitignore:");
console.log("  /public/instagram-cars/livy_motors_tz/");
console.log("  /public/instagram-cars/expert_motors_tz/");
