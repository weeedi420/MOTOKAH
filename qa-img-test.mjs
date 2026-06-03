import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';

async function run() {
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/rapid/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, geolocation: { latitude: -6.7924, longitude: 39.2083 }, permissions: ['geolocation'] });
  const p = await ctx.newPage();

  const failedImgs = [];
  const loadedImgs = [];
  p.on('response', r => {
    if (!r.url().includes('fbcdn')) return;
    if (r.status() !== 200) failedImgs.push(`${r.status()}: ${r.url().slice(0,80)}`);
    else loadedImgs.push(r.url().slice(0,60));
  });

  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 5; i++) {
    await p.waitForTimeout(400);
    const tz = await p.$('text=Tanzania'); if (tz) { await tz.click(); continue; }
    const dar = await p.$('text=Dar es Salaam'); if (dar) { await dar.click(); continue; }
    const c = await p.$('button:has-text("Continue"),button:has-text("Done"),button:has-text("Start")'); if (c) { await c.click(); continue; }
  }
  await p.waitForTimeout(800);

  await p.goto(`${BASE}/dealer/khushimotorsdaressalaam`, { waitUntil: 'domcontentloaded', timeout: 12000 });
  await p.waitForTimeout(10000); // 10s for images

  const imgStats = await p.evaluate(() => {
    const all = [...document.querySelectorAll('img')];
    return { total: all.length, loaded: all.filter(i => i.complete && i.naturalWidth > 0).length, broken: all.filter(i => i.complete && i.naturalWidth === 0).length };
  });

  console.log('Image stats:', imgStats);
  console.log('CDN loaded:', loadedImgs.length);
  console.log('CDN failed:', failedImgs.length, failedImgs.slice(0, 3));
  await p.screenshot({ path: 'D:/qa-final2/khushi-10s.png', fullPage: false });
  await b.close();
}
run().catch(e => console.error(e.message));
