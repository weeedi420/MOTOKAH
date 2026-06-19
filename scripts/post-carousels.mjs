/**
 * Generates, uploads and posts the 3 Motokah UI/UX carousels to @motokahafrica.
 * Usage:
 *   node scripts/post-carousels.mjs --dry-run      # generate PNGs only
 *   node scripts/post-carousels.mjs --carousel=1   # post carousel 1 only
 *   node scripts/post-carousels.mjs                # post all 3
 */
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { carousel1, carousel2, carousel3 } from '../content/instagram/carousel-templates.mjs';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT  = path.join(ROOT, 'content', 'instagram', 'carousels');
fs.mkdirSync(OUT, { recursive: true });

const EXE = 'C:/Users/rapid/AppData/Local/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-win64/chrome-headless-shell.exe';

const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')
    .map(l => l.match(/^([A-Z_]+)=["']?(.*?)["']?\s*$/)).filter(Boolean)
    .map(m => [m[1], m[2]])
);
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const IG_TOKEN = env.IG_GRAPH_TOKEN;
const IG_UID   = env.IG_USER_ID;
const BUCKET   = 'ig-posts';
const DRY_RUN  = process.argv.includes('--dry-run');
const onlyArg  = process.argv.find(a => a.startsWith('--carousel='));
const ONLY     = onlyArg ? parseInt(onlyArg.split('=')[1]) : null;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const CAROUSELS = [
  {
    id: 1,
    slides: carousel1(),
    caption: `The future of car buying in East Africa is here.

We built Motokah to fix what was broken: unverified sellers, hidden prices and no way to compare across cities.

One platform. Every make. Every city. Kenya, Tanzania, Uganda, Rwanda, Ethiopia.

Find your next car at motokah.com — link in bio.

#motokah #eastafrica #cars #carmarketplace #kenya #tanzania #uganda #nairobi #daressalaam #carsforsale`,
  },
  {
    id: 2,
    slides: carousel2(),
    caption: `3 features that change how East Africa buys cars.

Smart filtering that actually works. Transparent pricing with import duty estimates. Direct seller chat with zero brokers in between.

Which feature are you most excited to use? Drop it in the comments.

motokah.com — link in bio.

#motokah #eastafrica #carmarketplace #uxdesign #carsforsale #kenya #tanzania #nairobi #daressalaam #buycars`,
  },
  {
    id: 3,
    slides: carousel3(),
    caption: `Same power. Any screen. Any network.

Motokah is built for real East Africa — fast on 3G, clean on mobile, full-featured on desktop. Swahili and English. Old phones and new ones.

Browse thousands of verified car listings right now.

motokah.com — link in bio.

#motokah #eastafrica #mobiledesign #carmarketplace #kenya #tanzania #cars #usedcars #technology #nairobi`,
  },
];

function igRequest(endpoint, params) {
  const qs = new URLSearchParams(params).toString();
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'graph.facebook.com',
      path: `/v19.0/${endpoint}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(qs) },
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, data: { raw: b } }); }
      });
    });
    req.on('error', reject);
    req.write(qs); req.end();
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: EXE });
  const page    = await browser.newPage({ viewport: { width: 1080, height: 1350 } });

  const toPost = ONLY ? CAROUSELS.filter(c => c.id === ONLY) : CAROUSELS;

  for (const carousel of toPost) {
    console.log(`\n=== Carousel ${carousel.id} (${carousel.slides.length} slides) ===`);
    const slideDir = path.join(OUT, `carousel-${carousel.id}`);
    fs.mkdirSync(slideDir, { recursive: true });

    const publicUrls = [];

    // 1. Generate + upload each slide
    for (let i = 0; i < carousel.slides.length; i++) {
      const html = carousel.slides[i];
      await page.setContent(html, { waitUntil: 'load' });
      await page.waitForTimeout(300);
      const file = path.join(slideDir, `slide-${i + 1}.png`);
      await page.locator('.frame').screenshot({ path: file });
      console.log(`  Slide ${i+1} generated: ${file}`);

      if (DRY_RUN) continue;

      const buf = fs.readFileSync(file);
      const key = `carousels/c${carousel.id}/slide-${i+1}-${Date.now()}.png`;
      const { error } = await supabase.storage.from(BUCKET).upload(key, buf, { contentType: 'image/png', upsert: true });
      if (error) { console.error(`  Upload error slide ${i+1}:`, error.message); continue; }
      const { data: ud } = supabase.storage.from(BUCKET).getPublicUrl(key);
      publicUrls.push(ud.publicUrl);
      console.log(`  Uploaded: ${ud.publicUrl}`);
    }

    if (DRY_RUN) { console.log('  DRY RUN — skipping IG post'); continue; }
    if (publicUrls.length !== carousel.slides.length) {
      console.error(`  Only ${publicUrls.length}/${carousel.slides.length} slides uploaded — skipping post`);
      continue;
    }

    // 2. Create individual IG media containers (carousel items)
    const childIds = [];
    for (const url of publicUrls) {
      const res = await igRequest(`${IG_UID}/media`, {
        image_url: url,
        is_carousel_item: 'true',
        access_token: IG_TOKEN,
      });
      if (res.data.error) { console.error('  Carousel item error:', res.data.error.message); continue; }
      childIds.push(res.data.id);
      console.log(`  Carousel item created: ${res.data.id}`);
      await sleep(1000);
    }

    if (childIds.length < 2) { console.error('  Not enough carousel items — skipping'); continue; }

    // 3. Create carousel container
    await sleep(2000);
    const container = await igRequest(`${IG_UID}/media`, {
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption: carousel.caption,
      access_token: IG_TOKEN,
    });
    console.log(`  Carousel container HTTP ${container.status}`);
    if (container.data.error) {
      console.error('  Container error:', container.data.error.message);
      continue;
    }

    // 4. Publish
    await sleep(5000);
    const pub = await igRequest(`${IG_UID}/media_publish`, {
      creation_id: container.data.id,
      access_token: IG_TOKEN,
    });
    console.log(`  Publish HTTP ${pub.status}:`, JSON.stringify(pub.data).slice(0, 100));
    if (pub.data.id) console.log(`  POSTED. IG media ID: ${pub.data.id}`);
    else if (pub.data.error) console.error('  Publish error:', pub.data.error.message);

    if (toPost.indexOf(carousel) < toPost.length - 1) await sleep(5000);
  }

  await browser.close();
  console.log('\nDone.');
}

main().catch(console.error);
