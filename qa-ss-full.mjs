import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
mkdirSync('D:/qa-final2', { recursive: true });
const BASE = 'http://localhost:5173';

async function run() {
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Users/rapid/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 900 }, geolocation: { latitude: -6.7924, longitude: 39.2083 }, permissions: ['geolocation'] });
  const p = await ctx.newPage();

  // bypass wizard
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 5; i++) {
    await p.waitForTimeout(400);
    const tz = await p.$('text=Tanzania'); if (tz) { await p.$eval('text=Tanzania', e => e.click()); continue; }
    const dar = await p.$('text=Dar es Salaam'); if (dar) { await p.$eval('text=Dar es Salaam', e => e.click()); continue; }
    const c = await p.$('button:has-text("Continue"),button:has-text("Done"),button:has-text("Start")'); if (c) { await c.click(); continue; }
  }
  await p.waitForTimeout(800);

  const dealers = ['khushimotorsdaressalaam','mgayamotors','ruge_magari','njari_motors','ezy_auto_motors','ibaraki','al_husnainmotors','boxerpoa'];
  for (const d of dealers) {
    await p.goto(`${BASE}/dealer/${d}`, { waitUntil: 'domcontentloaded', timeout: 12000 });
    await p.waitForTimeout(5000); // extra wait for Instagram CDN
    await p.screenshot({ path: `D:/qa-final2/${d}.png`, fullPage: false, timeout: 10000 }).catch(() => {});
    const inv = await p.evaluate(() => document.body.textContent?.match(/Inventory\s*\((\d+)\)/)?.[1] || '?');
    console.log(`[${d}] inventory: ${inv}`);
  }

  await b.close();
  console.log('Done → D:/qa-final2/');
}
run().catch(e => console.error(e.message));
