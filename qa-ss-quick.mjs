import { chromium } from 'playwright';
const BASE = 'http://localhost:5174';
async function run() {
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/rapid/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, geolocation: { latitude: -6.7924, longitude: 39.2083 }, permissions: ['geolocation'] });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 5; i++) {
    await p.waitForTimeout(400);
    const tz = await p.$('text=Tanzania'); if (tz) { await tz.click(); continue; }
    const dar = await p.$('text=Dar es Salaam'); if (dar) { await dar.click(); continue; }
    const c = await p.$('button:has-text("Continue"),button:has-text("Done"),button:has-text("Start")'); if (c) { await c.click(); continue; }
  }
  await p.waitForTimeout(800);

  // Khushi — check mileage/price
  await p.goto(`${BASE}/dealer/khushimotorsdaressalaam`, { waitUntil: 'domcontentloaded', timeout: 12000 });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: 'D:/qa-final/khushi.png', fullPage: false }); // viewport only - faster

  // Ruge — prices + titles
  await p.goto(`${BASE}/dealer/ruge_magari`, { waitUntil: 'domcontentloaded', timeout: 12000 });
  await p.waitForTimeout(2000);
  await p.screenshot({ path: 'D:/qa-final/ruge.png', fullPage: false });

  // Boxerpoa — promo check
  await p.goto(`${BASE}/dealer/boxerpoa`, { waitUntil: 'domcontentloaded', timeout: 12000 });
  await p.waitForTimeout(2000);
  await p.screenshot({ path: 'D:/qa-final/boxerpoa.png', fullPage: false });

  await b.close();
  console.log('Done — D:/qa-final/');
}
import { mkdirSync } from 'fs'; mkdirSync('D:/qa-final', { recursive: true });
run().catch(e => console.error(e.message));
