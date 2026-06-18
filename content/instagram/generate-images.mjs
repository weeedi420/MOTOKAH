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
  const stripDash = s => s.replace(/\s*[—–]\s*/g, ' - ').replace(/\s+/g, ' ').trim();
  const title = esc(stripDash(p.title.replace(/—.*$/, '')));
  const sub = esc(stripDash(p.caption || ''));
  const sw = esc(stripDash(p.caption_sw || ''));
  const newsTitle = esc(p.title);

  // ── LISTING: clean white card, full car visible (no crop) ──────────────────
  const body = carCard ? `
    <div class="listing">
      <div class="lheader">
        <div class="logo">Motokah</div>
        <div class="ltag">${esc(p.pillar || 'Featured Car')}</div>
      </div>
      <div class="card">
        <div class="cimg-wrap">
          <img class="cimg" src="${car.image}" alt="${esc(car.title)}" />
        </div>
        <div class="cdivider"></div>
        <div class="cbody">
          <div class="ctitle">${esc(car.title)}</div>
          <div class="cprice">${fmtPrice(car.price, car.currency)}</div>
          <div class="cmeta">${esc(car.city)} &nbsp;·&nbsp; ${car.year}</div>
        </div>
      </div>
      <div class="lfooter">
        <div class="lftxt">${title}${sub ? ` - ${sub}` : ''}</div>
        <div class="lfhandle">@motokahafrica</div>
      </div>
    </div>

  ` : news ? `
  <!-- ── NEWS ── -->
    <span class="deco d1"></span><span class="deco d2"></span>
    <div class="news">
      <div class="ntop">
        <div class="logo">Motokah</div>
        <div class="nbadge">NEWS</div>
      </div>
      <div class="nrule"></div>
      <div class="nbody">
        <div class="nhead">${newsTitle}</div>
        ${sub ? `<div class="ncap">${sub}</div>` : ''}
        ${sw  ? `<div class="nsw">${sw}</div>`  : ''}
      </div>
      <div class="nfoot">
        <span class="nhandle">@motokahafrica</span>
        <span class="ntag">${esc(p.pillar || 'News')}</span>
      </div>
    </div>

  ` : `
  <!-- ── BRAND ── -->
    <span class="deco d1"></span><span class="deco d2"></span>
    <div class="brand">
      <div class="logo blg">Motokah</div>
      <div class="bsub">AFRICA'S CAR MARKETPLACE</div>
      <div class="btitle">${title}</div>
      ${sub ? `<div class="bcap">${sub}</div>` : ''}
      ${sw  ? `<div class="bsw">${sw}</div>`   : ''}
      <div class="bhandle">@motokahafrica</div>
    </div>
  `;

  /* Website exact blue: hsl(210,100%,40%) = #0066CC */
  return `<!doctype html><html><head><meta charset="utf8"><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',system-ui,sans-serif}

/* ── canvas — exact Motokah brand blue ── */
.frame{
  width:1080px;height:1080px;position:relative;overflow:hidden;color:#fff;
  background:linear-gradient(150deg,#0077ee 0%,#0066cc 45%,#0052a3 100%)
}
.deco{position:absolute;border-radius:50%}
.d1{width:500px;height:500px;top:-120px;right:-120px;background:rgba(255,255,255,.08)}
.d2{width:360px;height:360px;bottom:-110px;left:-90px;background:rgba(255,255,255,.05)}

/* ── logo (always white) ── */
.logo{font-size:42px;font-weight:900;letter-spacing:-1px;color:#fff;line-height:1;white-space:nowrap}
.logo:after{content:'';display:inline-block;width:11px;height:11px;background:#f5a623;border-radius:50%;margin-left:4px;vertical-align:7px}

/* ═══════════════════════════════════════════
   LISTING CARD  (blue bg + white card)
═══════════════════════════════════════════ */
.listing{position:absolute;inset:0;display:flex;flex-direction:column;padding:50px 54px}
.lheader{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-shrink:0}
.ltag{background:rgba(255,255,255,.22);color:#fff;font-weight:700;font-size:20px;letter-spacing:2px;text-transform:uppercase;padding:8px 22px;border-radius:999px}
/* card fills middle space */
.card{background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,50,.3);flex:1;display:flex;flex-direction:column;min-height:0}
/* image: object-fit:contain so NO ZOOM — shows full car on light blue-white bg */
.cimg-wrap{flex:1;background:#f0f6ff;display:flex;align-items:center;justify-content:center;overflow:hidden;min-height:0}
.cimg{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;display:block}
.cdivider{height:1px;background:#dde8f5;flex-shrink:0}
.cbody{padding:20px 30px 24px;flex-shrink:0}
.ctitle{color:#0d2040;font-size:32px;font-weight:800;line-height:1.2;margin-bottom:4px}
.cprice{color:#0066cc;font-size:42px;font-weight:900;line-height:1;margin-bottom:4px}
.cmeta{color:#5a7090;font-size:23px}
/* footer strip outside card */
.lfooter{flex-shrink:0;padding-top:22px;border-top:2px solid rgba(255,255,255,.22);margin-top:20px}
.lftxt{font-size:28px;font-weight:700;color:#fff;line-height:1.25;margin-bottom:8px}
.lfhandle{font-size:26px;font-weight:800;color:rgba(255,255,255,.9)}

/* ═══════════════════════════════════════════
   NEWS  (all blue, orange badge)
═══════════════════════════════════════════ */
.news{position:absolute;inset:0;display:flex;flex-direction:column;padding:66px 62px;z-index:2}
.ntop{display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.nbadge{background:#f5a623;color:#0a1730;font-weight:900;font-size:22px;letter-spacing:3px;padding:8px 22px;border-radius:8px}
.nrule{height:4px;background:rgba(255,255,255,.28);border-radius:4px;margin:28px 0;flex-shrink:0}
.nbody{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0}
.nhead{font-size:64px;font-weight:900;line-height:1.07;margin-bottom:24px;color:#fff}
.ncap{font-size:33px;line-height:1.5;color:rgba(255,255,255,.9);margin-bottom:16px}
.nsw{font-size:27px;font-style:italic;color:#ffd98a;line-height:1.4}
.nfoot{display:flex;align-items:center;justify-content:space-between;border-top:2px solid rgba(255,255,255,.22);padding-top:24px;margin-top:28px;flex-shrink:0}
.nhandle{font-size:26px;font-weight:800;color:#fff}
.ntag{background:rgba(255,255,255,.15);font-weight:700;font-size:21px;padding:6px 18px;border-radius:999px;color:#fff}

/* ═══════════════════════════════════════════
   BRAND  (blue gradient, centered white text)
═══════════════════════════════════════════ */
.brand{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px 88px;z-index:2}
.blg{font-size:52px;margin-bottom:8px}
.bsub{font-size:17px;letter-spacing:7px;color:rgba(255,255,255,.6);margin-bottom:50px;text-transform:uppercase}
.btitle{font-size:72px;font-weight:900;line-height:1.06;margin-bottom:22px;max-width:900px;color:#fff}
.bcap{font-size:33px;color:rgba(255,255,255,.88);line-height:1.45;margin-bottom:14px;max-width:820px}
.bsw{font-size:27px;font-style:italic;color:#ffd98a;margin-bottom:50px;line-height:1.4}
.bhandle{font-size:27px;font-weight:800;color:#fff;border-top:2px solid rgba(255,255,255,.3);padding-top:24px;width:100%;text-align:center}
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
