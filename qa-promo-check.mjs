import { chromium } from 'playwright';

const BASE = 'http://localhost:5174';
const DEALERS = ['al_husnainmotors','khushimotorsdaressalaam','njari_motors','boxerpoa','amjad_motors_international_ltd','pikipiki_quality_tanzania','mr_pikipiki','ruge_magari','ezy_auto_motors'];

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/rapid/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe' });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, geolocation: { latitude: -6.7924, longitude: 39.2083 }, permissions: ['geolocation'] });
  const page = await ctx.newPage();

  // bypass wizard
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(400);
    const tz = await page.$('text=Tanzania'); if (tz) { await tz.click(); continue; }
    const dar = await page.$('text=Dar es Salaam'); if (dar) { await dar.click(); continue; }
    const c = await page.$('button:has-text("Continue"),button:has-text("Done"),button:has-text("Start")');
    if (c) { await c.click(); continue; }
  }
  await page.waitForTimeout(800);

  for (const d of DEALERS) {
    await page.goto(`${BASE}/dealer/${d}`, { waitUntil: 'domcontentloaded', timeout: 12000 });
    await page.waitForTimeout(2000);

    const data = await page.evaluate(() => {
      const allTitles = [...document.querySelectorAll('h3,h2,[class*="title"],[class*="Title"]')]
        .map(e => e.textContent?.trim()).filter(t => t && t.length > 3 && t.length < 100);
      const invText = document.body.textContent?.match(/Inventory\s*\((\d+)\)/)?.[1] || '?';
      return { inventory: invText, titles: allTitles.slice(0, 8) };
    });

    console.log(`\n[${d}] inventory:${data.inventory}`);
    data.titles.forEach(t => {
      const isPromo = /WEEKEND|CHANCE|MUBARAK|decade|trust|TRUST|season|SEASON|congrat|deliver|customer|team|winner|giveaway|opening|anniversary|celebrate|TAARIFA|ASANTE|SHUKRANI|safari\s+kwenda/i.test(t);
      if (isPromo) console.log(`  [PROMO STILL SHOWING] ${t}`);
      else if (!t.toLowerCase().includes('inventory')) console.log(`  ${t}`);
    });
  }

  await browser.close();
}
run().catch(e => console.error('[FATAL]', e.message));
