import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:5174';
const OUT = 'D:/qa-verify';
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Users/rapid/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
  });
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    geolocation: { latitude: -6.7924, longitude: 39.2083 },
    permissions: ['geolocation'],
  });
  const page = await ctx.newPage();

  // bypass wizard
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(500);
    const tz = await page.$('text=Tanzania'); if (tz) { await tz.click(); continue; }
    const dar = await page.$('text=Dar es Salaam'); if (dar) { await dar.click(); continue; }
    const c = await page.$('button:has-text("Continue"),button:has-text("Done"),button:has-text("Start")');
    if (c) { await c.click(); continue; }
  }
  await page.waitForTimeout(1000);

  const dealers = [
    'khushimotorsdaressalaam',
    'mgayamotors',
    'ruge_magari',
    'njari_motors',
    'ezy_auto_motors',
    'ibaraki',
  ];

  for (const d of dealers) {
    await page.goto(`${BASE}/dealer/${d}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${OUT}/${d}.png`, fullPage: true });
    // Log what we see: prices, titles, image count
    const stats = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="card"],[class*="Card"]');
      const prices = [...document.querySelectorAll('[class*="price"],[class*="Price"]')]
        .map(e => e.textContent?.trim()).filter(Boolean).slice(0, 5);
      const titles = [...document.querySelectorAll('h3,h2,[class*="title"]')]
        .map(e => e.textContent?.trim()).filter(t => t && t.length > 3 && t.length < 80).slice(0, 8);
      const brokenImgs = [...document.querySelectorAll('img')].filter(img => !img.complete || img.naturalWidth === 0).length;
      const totalImgs = document.querySelectorAll('img').length;
      return { cards: cards.length, prices: prices.slice(0,3), titles: titles.slice(0,5), brokenImgs, totalImgs };
    });
    console.log(`\n[${d}] cards:${stats.cards} broken_imgs:${stats.brokenImgs}/${stats.totalImgs}`);
    console.log('  prices:', stats.prices);
    console.log('  titles:', stats.titles);
  }

  await browser.close();
  console.log('\nDone:', OUT);
}
run().catch(e => console.error('[FATAL]', e.message));
