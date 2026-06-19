// Generate 1080x1080 Instagram post images from content_posts.
// Usage: node content/instagram/generate-images.mjs
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildHtml } from './templates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUT  = path.join(__dirname, 'generated');
const EXE  = 'C:/Users/rapid/AppData/Local/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-win64/chrome-headless-shell.exe';
fs.mkdirSync(OUT, { recursive: true });

const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')
    .map(l => l.match(/^([A-Z_]+)=["']?(.*?)["']?\s*$/)).filter(Boolean)
    .map(m => [m[1], m[2]])
);
const SUPA_URL = env.VITE_SUPABASE_URL;
const SUPA_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const cars  = JSON.parse(fs.readFileSync(path.join(__dirname, 'cars.json'), 'utf8'));
const posts = await (await fetch(
  `${SUPA_URL}/rest/v1/content_posts?select=*&order=scheduled_date.asc`,
  { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
)).json();
console.log(`Fetched ${posts.length} posts`);

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);

const browser = await chromium.launch({ headless: true, executablePath: EXE });
const page    = await browser.newPage({ viewport: { width: 1080, height: 1080 } });

let i=0, ok=0;
for (const p of posts) {
  i++;
  const car = cars[i % cars.length];
  try {
    await page.setContent(buildHtml(p, car), { waitUntil: 'load' });
    await page.waitForFunction(
      () => { const img=document.querySelector('.car-img'); return !img||img.complete; },
      { timeout: 8000 }
    ).catch(()=>{});
    await page.waitForTimeout(250);
    const file = path.join(OUT, `${String(i).padStart(2,'0')}-${slug(p.title)}.png`);
    await page.locator('.frame').screenshot({ path: file });
    ok++;
    console.log(`[${i}/${posts.length}] ${path.basename(file)}`);
  } catch(e) {
    console.error(`[${i}] FAIL ${p.title}: ${e.message}`);
  }
}
await browser.close();
console.log(`\nDone. ${ok}/${posts.length} images -> ${OUT}`);
