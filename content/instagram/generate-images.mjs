// Generate 1080x1080 Instagram post images from content_posts + real car photos.
// Usage: node content/instagram/generate-images.mjs
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'generated');
const EXE = 'C:/Users/rapid/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe';
fs.mkdirSync(OUT, { recursive: true });

// ── read .env for supabase creds ──
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')
    .map(l => l.match(/^([A-Z_]+)=["']?(.*?)["']?\s*$/)).filter(Boolean)
    .map(m => [m[1], m[2]])
);
const SUPA_URL = env.VITE_SUPABASE_URL;
const SUPA_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const cars = JSON.parse(fs.readFileSync(path.join(__dirname, 'cars.json'), 'utf8'));

const posts = await (await fetch(
  `${SUPA_URL}/rest/v1/content_posts?select=*&order=scheduled_date.asc`,
  { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
)).json();
console.log(`Fetched ${posts.length} content posts, ${cars.length} cars`);

const fmtPrice = (p, c) => `${c} ${Number(p).toLocaleString()}`;
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function isCarCard(p) {
  return p.pillar === 'Listings' || p.pillar === 'Promotion' || /^From /i.test(p.title) || /Sunday Drive/i.test(p.title);
}

function html(p, car) {
  const carCard = isCarCard(p);
  const priceBadge = carCard
    ? `<div class="price">${fmtPrice(car.price, car.currency)}</div>
       <div class="meta">${esc(car.city)} · ${car.year}</div>`
    : '';
  const title = esc(p.title.replace(/—.*$/, '').trim());
  const sub = esc(p.caption || '');
  const sw = esc(p.caption_sw || '');

  // CAR CARD: photo prominent + price panel.  BRAND: dimmed full-bleed + centered.
  const body = carCard ? `
    <div class="photo" style="background-image:url('${car.image}')"></div>
    <div class="panel">
      <div class="tag">${esc(p.pillar || 'Featured')}</div>
      <div class="headline">${title}</div>
      <div class="sub">${sub}</div>
      <div class="sw">${sw}</div>
      <div class="row">
        <div class="pricewrap">${priceBadge}</div>
        <div class="handle">@motokahafrica</div>
      </div>
    </div>
  ` : `
    <div class="bg" style="background-image:url('${car.image}')"></div>
    <div class="overlay"></div>
    <div class="center">
      <div class="wordmark">MOTOKAH</div>
      <div class="tagline">AFRICA'S CAR MARKETPLACE</div>
      <div class="big">${title}</div>
      <div class="bigsub">${sub}</div>
      <div class="bigsw">${sw}</div>
      <div class="handle2">@motokahafrica</div>
    </div>`;

  return `<!doctype html><html><head><meta charset="utf8"><style>
  *{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',system-ui,sans-serif}
  .frame{width:1080px;height:1080px;position:relative;overflow:hidden;background:#0a0e15;color:#fff}
  /* car card */
  .photo{position:absolute;top:0;left:0;width:100%;height:600px;background-size:cover;background-position:center}
  .photo:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,14,21,0) 55%,#0a0e15 100%)}
  .panel{position:absolute;bottom:0;left:0;right:0;padding:48px 56px 56px}
  .tag{display:inline-block;background:#e8b84b;color:#0a0e15;font-weight:800;font-size:20px;letter-spacing:1px;text-transform:uppercase;padding:6px 16px;border-radius:999px;margin-bottom:18px}
  .headline{font-size:62px;font-weight:800;line-height:1.05;margin-bottom:16px}
  .sub{font-size:30px;color:#c7cedb;line-height:1.35;margin-bottom:10px}
  .sw{font-size:26px;color:#e8b84b;font-style:italic;margin-bottom:28px}
  .row{display:flex;align-items:flex-end;justify-content:space-between}
  .price{font-size:46px;font-weight:800;color:#fff}
  .meta{font-size:24px;color:#9aa3b2}
  .handle{font-size:26px;font-weight:700;color:#e8b84b}
  /* brand */
  .bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:saturate(1.1)}
  .overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(8,11,18,.82),rgba(8,11,18,.94))}
  .center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px}
  .wordmark{font-size:40px;font-weight:900;letter-spacing:8px;color:#e8b84b}
  .tagline{font-size:18px;letter-spacing:5px;color:#9aa3b2;margin-bottom:50px}
  .big{font-size:78px;font-weight:900;line-height:1.05;margin-bottom:24px;max-width:880px}
  .bigsub{font-size:34px;color:#dfe4ee;line-height:1.4;margin-bottom:16px;max-width:820px}
  .bigsw{font-size:28px;color:#e8b84b;font-style:italic;margin-bottom:48px}
  .handle2{font-size:30px;font-weight:700;color:#fff;border-top:2px solid #e8b84b;padding-top:24px}
  </style></head><body><div class="frame">${body}</div></body></html>`;
}

const browser = await chromium.launch({ headless: true, executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });

let i = 0, ok = 0;
for (const p of posts) {
  i++;
  const car = cars[i % cars.length];
  try {
    await page.setContent(html(p, car), { waitUntil: 'load' });
    // wait for the car image to actually load
    await page.waitForFunction(() => {
      const el = document.querySelector('.photo, .bg');
      return true; // background-image has no load event; small fixed wait below
    }).catch(() => {});
    await page.waitForTimeout(1400);
    const file = path.join(OUT, `${String(i).padStart(2, '0')}-${slug(p.title)}.png`);
    await page.locator('.frame').screenshot({ path: file });
    ok++;
    console.log(`[${i}/${posts.length}] ${path.basename(file)}`);
  } catch (e) {
    console.log(`[${i}] FAIL ${p.title}: ${e.message}`);
  }
}
await browser.close();
console.log(`\nDone. ${ok}/${posts.length} images -> ${OUT}`);
