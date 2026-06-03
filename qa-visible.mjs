import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
mkdirSync('D:/qa-final4', { recursive: true });

const BASE = 'http://localhost:5173';

async function run() {
  const b = await chromium.launch({
    headless: false, // visible browser — triggers lazy loading properly
    executablePath: 'C:/Users/rapid/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
    slowMo: 100,
  });
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

  for (const [slug, label] of [
    ['khushimotorsdaressalaam', 'Khushi'],
    ['mgayamotors', 'Mgaya'],
    ['ruge_magari', 'Ruge'],
    ['ezy_auto_motors', 'Ezy Auto'],
  ]) {
    console.log(`Capturing ${label}...`);
    await p.goto(`${BASE}/dealer/${slug}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await p.waitForTimeout(5000); // let viewport images load

    // Screenshot viewport only (just what user sees on arrival)
    await p.screenshot({ path: `D:/qa-final4/${slug}-viewport.png`, fullPage: false, timeout: 10000 }).catch(() => {});

    // Scroll down slowly to trigger lazy load, then screenshot
    for (let y = 0; y <= 1200; y += 300) {
      await p.evaluate((y) => window.scrollTo(0, y), y);
      await p.waitForTimeout(1500);
    }
    await p.screenshot({ path: `D:/qa-final4/${slug}-scrolled.png`, fullPage: false, timeout: 10000 }).catch(() => {});

    const stats = await p.evaluate(() => {
      const imgs = [...document.querySelectorAll('[class*="card"] img, [class*="Card"] img')];
      return { loaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length, total: imgs.length };
    });
    console.log(`  ${label}: ${stats.loaded}/${stats.total} card images loaded`);
  }

  await b.close();
  console.log('Done → D:/qa-final4/');
}
run().catch(e => console.error(e.message));
