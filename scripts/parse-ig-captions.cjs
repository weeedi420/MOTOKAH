/**
 * Step 3: Parse Instaloader captions + merge with image files → final CSV
 *
 * Run AFTER downloading with Instaloader:
 *   pip install instaloader
 *   instaloader --no-video-thumbnails profile lomaautos_ rakincars.tz wazirmotor ...
 *
 * Instaloader saves files like:
 *   {username}/{shortcode}_UTC.txt   ← caption text
 *   {username}/{shortcode}_UTC_1.jpg ← images
 *
 * Usage:
 *   node scripts/parse-ig-captions.cjs "D:\instaloader-output" "D:\cars for motokah"
 *
 * Output: ig-cars-full.csv
 */

const fs = require('fs');
const path = require('path');

const CAPTION_DIR  = process.argv[2] || 'D:\\instaloader-output';
const PHOTOS_DIR   = process.argv[3] || 'D:\\cars for motokah';
const OUTPUT_CSV   = path.join(process.cwd(), 'ig-cars-full.csv');

// ─── Car make list ───────────────────────────────────────────
const MAKES = [
  'Toyota','Nissan','Honda','Mazda','Subaru','BMW','Mercedes-Benz','Mercedes',
  'Volkswagen','Hyundai','Kia','Mitsubishi','Suzuki','Ford','Isuzu',
  'Land Rover','Range Rover','Lexus','Audi','Chevrolet','Peugeot','Renault',
  'Volvo','Jeep','Tata','Daihatsu','Changan','FAW','Jaguar','Porsche','Mini',
  'Citroen','Hino','Fuso','Datsun','Infiniti','Cadillac','Dodge','Fiat',
  'GMC','Maserati','Tesla','BYD','Chery','Opel','Skoda','Alfa Romeo',
  'Bentley','Ferrari','Lamborghini','Rolls-Royce','Hilux','Prado','Fortuner',
  'Harrier','RAV4','Fielder','Land Cruiser','Vitz','Premio','Allion',
  'Corolla','Camry','Vanguard','Wish','Noah','Alphard','Vellfire'
];

// ─── Phone extraction ────────────────────────────────────────
function extractPhones(text) {
  const t = text.replace(/\s+/g, ' ');
  const found = new Set();

  // International +CC format
  (t.match(/\+\d[\d\s\-\.]{9,16}/g) || []).forEach(m => {
    const n = m.replace(/[^\d+]/g, '');
    if (n.length >= 10 && n.length <= 16) found.add(n);
  });

  // Local 0-prefix
  (t.match(/\b0[67]\d[\d\s\-\.]{7,10}\b/g) || []).forEach(m => {
    const n = m.replace(/[^\d]/g, '');
    if (n.length >= 9 && n.length <= 12) found.add(n);
  });

  // After keywords
  const kwRe = /(?:whatsapp|call|tel|phone|contact|inbox|reach|ring|📞|📱|☎)\s*:?\s*(\+?[\d][\d\s\-\.()]{8,18})/gi;
  let m;
  while ((m = kwRe.exec(t)) !== null) {
    const n = m[1].replace(/[^\d+]/g, '');
    if (n.length >= 9 && n.length <= 16) found.add(n);
  }

  return [...found].slice(0, 5).join(' | ');
}

// ─── Car info extraction ─────────────────────────────────────
function parseCarInfo(text) {
  const yearM = text.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
  const year  = yearM ? yearM[0] : '';

  let make = '', model = '';
  for (const mk of MAKES) {
    if (text.toLowerCase().includes(mk.toLowerCase())) {
      make = mk;
      break;
    }
  }
  if (make) {
    const after = text.split(new RegExp(make, 'i'))[1] || '';
    const words = after.trim().split(/[\s,\/|#@]+/).filter(w => w.length > 1);
    model = words[0]?.replace(/[^a-zA-Z0-9\-]/g, '') || '';
  }

  // Price
  let price = '', currency = '';
  const priceM =
    text.match(/(?:KSh|TSh|₦|USh|KES|TZS|NGN|UGX|ZAR|ksh|tsh)\s?[\d,\.]+[kKmM]?/i) ||
    text.match(/[\d,\.]+[kKmM]?\s*(?:KSh|TSh|₦|USh|KES|TZS|NGN|UGX|ZAR|ksh|tsh)/i) ||
    text.match(/(?:price|asking|selling)[:\s]+[\d,\.]+[kKmM]?/i) ||
    text.match(/\$\s?[\d,\.]+[kKmM]?/);
  if (priceM) {
    price = priceM[0].trim();
    if (/KSh|KES|ksh/i.test(price)) currency = 'KES';
    else if (/TSh|TZS|tsh/i.test(price)) currency = 'TZS';
    else if (/₦|NGN/i.test(price)) currency = 'NGN';
    else if (/USh|UGX/i.test(price)) currency = 'UGX';
    else if (/ZAR/i.test(price)) currency = 'ZAR';
    else if (/\$|USD/i.test(price)) currency = 'USD';
  }

  const condM = text.match(/\b(brand[\s-]?new|ex[\s-]?japan|locally used|foreign used|fairly used|clean|accident[\s-]?free|neat)\b/i);
  const condition = condM ? condM[0] : '';

  const location = (text.match(/\b(dar es salaam|dar|nairobi|kampala|kigali|lagos|mombasa|arusha|dodoma|mwanza|zanzibar)\b/i) || [])[0] || '';

  return { make, model, year, price, currency, condition, location };
}

// ─── Quote CSV field ─────────────────────────────────────────
function q(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ─── Main ────────────────────────────────────────────────────
function main() {
  const rows = [];

  // ── Read Instaloader captions ──────────────────────────────
  if (fs.existsSync(CAPTION_DIR)) {
    console.log(`Reading captions from: ${CAPTION_DIR}`);

    const accounts = fs.readdirSync(CAPTION_DIR).filter(name =>
      fs.statSync(path.join(CAPTION_DIR, name)).isDirectory()
    );

    for (const account of accounts) {
      const dir = path.join(CAPTION_DIR, account);
      const files = fs.readdirSync(dir);
      const txtFiles = files.filter(f => f.endsWith('.txt'));

      for (const txt of txtFiles) {
        const caption = fs.readFileSync(path.join(dir, txt), 'utf8').trim();
        const shortcode = txt.replace(/_UTC.*$/, '');

        // Find matching images in same folder
        const imgFiles = files
          .filter(f => f.startsWith(shortcode) && /\.(jpg|jpeg|webp|heic|png)$/i.test(f))
          .map(f => path.join(dir, f));

        const info = parseCarInfo(caption);
        rows.push({
          username: account,
          shortcode,
          source: 'instaloader',
          post_url: `https://www.instagram.com/p/${shortcode}/`,
          make: info.make,
          model: info.model,
          year: info.year,
          price: info.price,
          currency: info.currency,
          condition: info.condition,
          location: info.location,
          phones: extractPhones(caption),
          image_count: imgFiles.length,
          img_1: imgFiles[0] || '',
          img_2: imgFiles[1] || '',
          img_3: imgFiles[2] || '',
          caption: caption.replace(/\n+/g, ' ').slice(0, 600)
        });
      }
    }
    console.log(`  → ${rows.length} posts with captions`);
  } else {
    console.log(`Caption dir not found: ${CAPTION_DIR}`);
    console.log('Run Instaloader first (see instructions below).\n');
  }

  // ── Also pull in photo-only data from Turbo Download ──────
  if (fs.existsSync(PHOTOS_DIR)) {
    console.log(`Reading photos from: ${PHOTOS_DIR}`);
    const FILE_RE = /^(.+?)_(\d+)_(\d+)_(\d+)\.(jpg|jpeg|webp|heic|png)$/i;

    const accounts = fs.readdirSync(PHOTOS_DIR).filter(name =>
      fs.statSync(path.join(PHOTOS_DIR, name)).isDirectory()
    );

    const postMap = new Map();
    for (const acc of accounts) {
      const dir = path.join(PHOTOS_DIR, acc);
      for (const file of fs.readdirSync(dir)) {
        const m = file.match(FILE_RE);
        if (!m) continue;
        const [, username, ts, post_id] = m;
        const key = `${username}|${ts}`;
        if (!postMap.has(key)) {
          postMap.set(key, { username, timestamp: parseInt(ts), post_id, images: [] });
        }
        postMap.get(key).images.push(path.join(dir, file));
      }
    }

    // Only add posts not already covered by captions
    const captionedShortcodes = new Set(rows.map(r => r.shortcode));
    let added = 0;

    for (const p of postMap.values()) {
      // Can't match by shortcode — add separately with no caption data
      // Skip if we already have caption data for this account at same date
      const date = new Date(p.timestamp < 1e12 ? p.timestamp * 1000 : p.timestamp).toISOString().slice(0, 10);
      rows.push({
        username: p.username,
        shortcode: p.post_id,
        source: 'turbo_download',
        post_url: `https://www.instagram.com/${p.username}/`,
        make: '', model: '', year: '', price: '', currency: '',
        condition: '', location: '', phones: '',
        image_count: p.images.length,
        img_1: p.images[0] || '',
        img_2: p.images[1] || '',
        img_3: p.images[2] || '',
        caption: `[date:${date} — no caption downloaded]`
      });
      added++;
    }
    console.log(`  → ${added} posts from Turbo Download (no caption)`);
  }

  if (rows.length === 0) {
    console.log('No data found. Check your folder paths.');
    return;
  }

  // ── Write CSV ─────────────────────────────────────────────
  const HEADERS = [
    'username', 'shortcode', 'source', 'post_url',
    'make', 'model', 'year', 'price', 'currency', 'condition', 'location',
    'phones', 'image_count', 'img_1', 'img_2', 'img_3', 'caption'
  ];

  const csvRows = [HEADERS.join(',')];
  for (const r of rows) {
    csvRows.push(HEADERS.map(h => q(r[h])).join(','));
  }

  fs.writeFileSync(OUTPUT_CSV, '﻿' + csvRows.join('\n'), 'utf8');
  console.log(`\n✅ Saved ${rows.length} rows → ${OUTPUT_CSV}`);

  const withPhone = rows.filter(r => r.phones).length;
  const withMake  = rows.filter(r => r.make).length;
  console.log(`   ${withPhone} rows have phone numbers`);
  console.log(`   ${withMake} rows have detected make`);
}

main();

// ─── Instaloader instructions (printed if captions dir missing) ──
if (!fs.existsSync(process.argv[2] || '')) {
  console.log(`
=== HOW TO GET CAPTIONS WITH INSTALOADER ===

1. Install Python (python.org) then:
   pip install instaloader

2. Run (logged in or not — public profiles work without login):
   instaloader --no-video-thumbnails --filename-pattern="{shortcode}_UTC" profile \\
     lomaautos_ rakincars.tz wazirmotor ukajapantz \\
     amjad_motors_international_ltd barari_motorstz \\
     fkmotorstanzania khushimotorsdaressalaam rwanko_motors

3. This saves {shortcode}_UTC.txt caption files alongside each image.

4. Then run this script:
   node scripts/parse-ig-captions.cjs "D:\\instaloader-output" "D:\\cars for motokah"
`);
}
