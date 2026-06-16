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
  const news = p.post_type === 'news';
  const carCard = !news && isCarCard(p);
  const priceBadge = carCard
    ? `<div class="price">${fmtPrice(car.price, car.currency)}</div>
       <div class="meta">${esc(car.city)} · ${car.year}</div>`
    : '';
  const title = esc(p.title.replace(/—.*$/, '').trim());
  const sub = esc(p.caption || '');
  const sw = esc(p.caption_sw || '');

  // Website style: blue background, white text, Motokah wordmark.
  // LISTING posts show the car inside a clean white card (site VehicleCard look).
  const newsTitle = esc(p.title);
  const body = news ? `
    <span class="deco d1"></span><span class="deco d2"></span>
    <div class="news">
      <div class="ntop">
        <div class="logo">Motokah</div>
        <div class="newsbadge">NEWS</div>
      </div>
      <div class="nrule"></div>
      <div class="nbody">
        <div class="nhead">${newsTitle}</div>
        <div class="ncap">${sub}</div>
        ${sw ? `<div class="nsw">${sw}</div>` : ''}
      </div>
      <div class="nfoot"><span>@motokahafrica</span><span class="ntag">${esc(p.pillar || 'News')}</span></div>
    </div>
  ` : carCard ? `
    <div class="listing">
      <div class="ltop">
        <div class="logo">Motokah</div>
        <div class="tag">${esc(p.pillar || 'Featured')}</div>
      </div>
      <div class="card">
        <div class="cimg" style="background-image:url('${car.image}')"></div>
        <div class="cbody">
          <div class="ctitle">${esc(car.title)}</div>
          <div class="cprice">${fmtPrice(car.price, car.currency)}</div>
          <div class="cmeta">📍 ${esc(car.city)}</div>
        </div>
      </div>
      <div class="lfoot">
        <div class="lhead">${title}</div>
        ${sub ? `<div class="lsub">${sub}</div>` : ''}
        <div class="handle2">@motokahafrica</div>
      </div>
    </div>
  ` : `
    <span class="deco d1"></span><span class="deco d2"></span>
    <div class="center">
      <div class="logo big-logo">Motokah</div>
      <div class="tagline">AFRICA'S CAR MARKETPLACE</div>
      <div class="big">${title}</div>
      <div class="bigsub">${sub}</div>
      ${sw ? `<div class="bigsw">${sw}</div>` : ''}
      <div class="handle2 center-handle">@motokahafrica</div>
    </div>`;

  return `<!doctype html><html><head><meta charset="utf8"><style>
  *{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',system-ui,sans-serif}
  .frame{width:1080px;height:1080px;position:relative;overflow:hidden;color:#fff;
    background:linear-gradient(160deg,#0a78e0 0%,#0057b8 55%,#004a9e 100%)}
  .deco{position:absolute;border-radius:50%;background:rgba(255,255,255,.06)}
  .d1{width:560px;height:560px;top:-160px;right:-160px}
  .d2{width:420px;height:420px;bottom:-150px;left:-130px;background:rgba(255,255,255,.05)}
  .logo{font-size:46px;font-weight:900;color:#fff;letter-spacing:-1px}
  .logo:after{content:'';display:inline-block;width:12px;height:12px;background:#f5a623;border-radius:50%;margin-left:4px;vertical-align:8px}
  /* ── listing card ── */
  .listing{position:absolute;inset:0;display:flex;flex-direction:column;padding:48px 52px}
  .ltop{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
  .tag{background:rgba(255,255,255,.18);color:#fff;font-weight:700;font-size:22px;letter-spacing:1px;text-transform:uppercase;padding:8px 20px;border-radius:999px}
  .card{background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 24px 50px rgba(0,0,0,.22)}
  .cimg{width:100%;height:430px;background-size:cover;background-position:center}
  .cbody{padding:24px 32px 28px}
  .ctitle{color:#0f1b2d;font-size:38px;font-weight:800;line-height:1.1;margin-bottom:8px}
  .cprice{color:#0066cc;font-size:48px;font-weight:900}
  .cmeta{color:#6b7686;font-size:26px;margin-top:4px}
  .lfoot{margin-top:auto;padding-top:28px}
  .lhead{font-size:50px;font-weight:800;line-height:1.08;margin-bottom:12px}
  .lsub{font-size:27px;color:rgba(255,255,255,.85);line-height:1.35;margin-bottom:18px}
  .handle2{font-size:30px;font-weight:800;color:#fff}
  /* ── brand ── */
  .center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:90px;z-index:2}
  .big-logo{font-size:58px;margin-bottom:6px}
  .tagline{font-size:20px;letter-spacing:6px;color:rgba(255,255,255,.7);margin-bottom:54px}
  .big{font-size:84px;font-weight:900;line-height:1.04;margin-bottom:26px;max-width:880px}
  .bigsub{font-size:36px;color:rgba(255,255,255,.92);line-height:1.4;margin-bottom:16px;max-width:820px}
  .bigsw{font-size:29px;color:#ffd98a;font-style:italic;margin-bottom:54px}
  .center-handle{position:static;border-top:2px solid rgba(255,255,255,.4);padding-top:26px}
  /* ── news ── */
  .news{position:absolute;inset:0;display:flex;flex-direction:column;padding:64px 60px;z-index:2}
  .ntop{display:flex;align-items:center;justify-content:space-between}
  .newsbadge{background:#f5a623;color:#0a1730;font-weight:900;font-size:26px;letter-spacing:3px;padding:8px 22px;border-radius:8px}
  .nrule{height:4px;background:rgba(255,255,255,.35);border-radius:4px;margin:26px 0 0}
  .nbody{margin-top:auto;margin-bottom:auto}
  .nhead{font-size:74px;font-weight:900;line-height:1.06;margin-bottom:30px}
  .ncap{font-size:38px;line-height:1.45;color:rgba(255,255,255,.95);margin-bottom:20px}
  .nsw{font-size:29px;font-style:italic;color:#ffd98a}
  .nfoot{display:flex;align-items:center;justify-content:space-between;font-size:28px;font-weight:800;color:#fff;border-top:2px solid rgba(255,255,255,.3);padding-top:26px}
  .ntag{background:rgba(255,255,255,.16);font-weight:700;font-size:24px;padding:6px 18px;border-radius:999px}
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
