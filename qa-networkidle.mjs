import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
mkdirSync('D:/qa-final3', { recursive: true });

const BASE = 'http://localhost:5173';

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

  for (const [slug, label] of [
    ['khushimotorsdaressalaam', 'Khushi'],
    ['mgayamotors', 'Mgaya'],
    ['ruge_magari', 'Ruge'],
    ['ezy_auto_motors', 'Ezy Auto'],
    ['al_husnainmotors', 'AL-Husnain'],
  ]) {
    console.log(`Capturing ${label}...`);
    // networkidle waits for all images to load
    await p.goto(`${BASE}/dealer/${slug}`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() =>
      p.goto(`${BASE}/dealer/${slug}`, { waitUntil: 'domcontentloaded', timeout: 10000 })
    );
    await p.waitForTimeout(2000);
    await p.screenshot({ path: `D:/qa-final3/${slug}.png`, fullPage: false, timeout: 10000 }).catch(() => {});

    const stats = await p.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')];
      return { loaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length, total: imgs.length };
    });
    console.log(`  ${label}: ${stats.loaded}/${stats.total} images loaded`);
  }

  await b.close();
  console.log('Done → D:/qa-final3/');
}
run().catch(e => console.error(e.message));
