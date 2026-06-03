import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:5174';
const SS = 'D:/qa-screenshots2';
fs.mkdirSync(SS, { recursive: true });

let n = 0;
const ss = async (page, name) => {
  n++;
  const f = `${SS}/${String(n).padStart(2,'0')}-${name}.png`;
  await page.screenshot({ path: f, fullPage: true });
  console.log(`[SS] ${f}`);
};

// bypass onboarding by going direct to /cars with proper state
async function bypassOnboarding(page) {
  await page.goto(BASE);
  await page.waitForTimeout(500);
  // Try clicking through the wizard fast
  // Step 1: location - click Tanzania then Dar es Salaam
  for (let attempt = 0; attempt < 5; attempt++) {
    const tz = await page.$('text=Tanzania');
    if (tz) { await tz.click(); break; }
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(300);
  const dar = await page.$('text=Dar es Salaam');
  if (dar) await dar.click();
  await page.waitForTimeout(300);
  const next1 = await page.$('button:has-text("Continue"), button:has-text("Next"), button:has-text("Confirm")');
  if (next1) await next1.click();
  await page.waitForTimeout(500);
  // Step 2: might be another step
  const next2 = await page.$('button:has-text("Continue"), button:has-text("Next"), button:has-text("Confirm")');
  if (next2) await next2.click();
  await page.waitForTimeout(500);
  // Step 3: language - click Continue
  const next3 = await page.$('button:has-text("Continue"), button:has-text("Done"), button:has-text("Start")');
  if (next3) await next3.click();
  await page.waitForTimeout(1000);
}

async function run() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:/Users/rapid/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'
  });
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    geolocation: { latitude: -6.7924, longitude: 39.2083 },
    permissions: ['geolocation']
  });
  const page = await ctx.newPage();

  await bypassOnboarding(page);
  await ss(page, 'home-after-onboarding');

  // ── MGAYA MOTORS - zoom into broken cards ────────────────────
  console.log('\n=== MGAYA MOTORS BROKEN CARDS ===');
  await page.goto(`${BASE}/dealer/mgayamotors`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  // Clip top section with first good cards
  await page.screenshot({ path: `${SS}/mgaya-row1.png`, clip: { x: 0, y: 0, width: 1400, height: 500 } });
  console.log('[SS] mgaya-row1');
  // Mid section with broken cards
  await page.screenshot({ path: `${SS}/mgaya-row2.png`, clip: { x: 0, y: 450, width: 1400, height: 500 } });
  console.log('[SS] mgaya-row2');
  await page.screenshot({ path: `${SS}/mgaya-row3.png`, clip: { x: 0, y: 900, width: 1400, height: 500 } });
  console.log('[SS] mgaya-row3');
  await page.screenshot({ path: `${SS}/mgaya-row4.png`, clip: { x: 0, y: 1350, width: 1400, height: 500 } });
  console.log('[SS] mgaya-row4');

  // Check card data
  const mgayaCards = await page.$$eval('[class*="card"], [class*="Card"]', els =>
    els.slice(0, 30).map(e => ({
      hasImg: !!e.querySelector('img[src]:not([src=""])'),
      imgSrc: e.querySelector('img')?.src?.slice(0,80) || 'NONE',
      hasPrice: /TZS|KSh|USD|\/=/.test(e.textContent || ''),
      text: e.textContent?.trim().replace(/\s+/g,' ').slice(0, 80)
    }))
  );
  console.log('[MGAYA CARDS]:');
  mgayaCards.forEach((c,i) => {
    if (!c.hasImg || !c.hasPrice) console.log(`  [BUG] card ${i}: img=${c.hasImg} price=${c.hasPrice} | ${c.text}`);
  });

  // ── LISTINGS PAGE + FILTER TEST ──────────────────────────────
  console.log('\n=== LISTINGS + FILTERS ===');
  await page.goto(`${BASE}/cars`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  await ss(page, 'listings-full');
  // zoom filters area
  await page.screenshot({ path: `${SS}/listings-filters-zoom.png`, clip: { x: 0, y: 100, width: 380, height: 700 } });
  console.log('[SS] listings-filters-zoom');
  await page.screenshot({ path: `${SS}/listings-cards-zoom.png`, clip: { x: 380, y: 100, width: 1020, height: 700 } });
  console.log('[SS] listings-cards-zoom');

  // Try Toyota filter
  const makeSelect = await page.$('select option[value="Toyota"]');
  if (makeSelect) {
    const select = await page.$('select:has(option[value="Toyota"])');
    await select.selectOption('Toyota');
    await page.waitForTimeout(1500);
    await ss(page, 'filter-toyota-results');
  }

  // Try price range
  const minPrice = await page.$('input[placeholder="Min"]');
  if (minPrice) {
    await minPrice.fill('5000000');
    await minPrice.press('Enter');
    await page.waitForTimeout(1000);
    await ss(page, 'filter-price-min-5m');
  }

  // City filter
  const citySelect = await page.$('select option[value="Dar es Salaam"]');
  if (citySelect) {
    const sel = await page.$('select:has(option[value="Dar es Salaam"])');
    await sel.selectOption('Dar es Salaam');
    await page.waitForTimeout(1500);
    await ss(page, 'filter-city-dar-results');
  }

  // ── FIRST CAR DETAIL ────────────────────────────────────────
  console.log('\n=== CAR DETAIL PAGE ===');
  await page.goto(`${BASE}/cars`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1000);
  const firstCar = await page.$('a[href*="/car/"]');
  if (firstCar) {
    const href = await firstCar.getAttribute('href');
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    await ss(page, 'car-detail-top');
    await page.screenshot({ path: `${SS}/car-detail-header-zoom.png`, clip: { x: 0, y: 0, width: 1400, height: 600 } });
    await page.evaluate(() => window.scrollTo(0, 600));
    await ss(page, 'car-detail-mid');
    await page.evaluate(() => window.scrollTo(0, 1200));
    await ss(page, 'car-detail-lower');

    // Copy test - select all text
    const selLen = await page.evaluate(() => {
      const range = document.createRange();
      range.selectNode(document.body);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      return sel.toString().length;
    });
    console.log(`[COPY TEST] Selected ${selLen} chars — ${selLen > 10 ? 'WORKS' : 'BLOCKED'}`);
    await ss(page, 'car-detail-select-all');
  }

  // ── MORE DEALERS ─────────────────────────────────────────────
  console.log('\n=== MORE DEALERS ===');
  const moreDeals = [
    '/dealer/khushimotorsdaressalaam',
    '/dealer/njari_motors',
    '/dealer/ruge_magari',
    '/dealer/ezy_auto_motors',
  ];
  for (const d of moreDeals) {
    try {
      await page.goto(`${BASE}${d}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      const slug = d.split('/').pop();
      await ss(page, `dealer-${slug}-top`);
      await page.evaluate(() => window.scrollTo(0, 500));
      await ss(page, `dealer-${slug}-mid`);
    } catch(e) {
      console.log(`[SKIP] ${d}: ${e.message.slice(0,50)}`);
    }
  }

  // ── LOCATION CHANGE FLOW ─────────────────────────────────────
  console.log('\n=== LOCATION CHANGE ===');
  await page.goto(`${BASE}/cars`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  // Find the location indicator in header
  await page.screenshot({ path: `${SS}/header-zoom.png`, clip: { x: 0, y: 0, width: 1400, height: 60 } });
  console.log('[SS] header-zoom');
  // Look for any location buttons
  const locEls = await page.$$eval('[class*="location"], [class*="city"], [aria-label*="location"]',
    els => els.map(e => ({ tag: e.tagName, text: e.textContent?.trim().slice(0,40), class: e.className?.toString().slice(0,50) }))
  );
  console.log('[LOC ELEMENTS]:', locEls);

  // ── MOBILE VIEW ──────────────────────────────────────────────
  console.log('\n=== MOBILE ===');
  await ctx.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/cars`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);
  await ss(page, 'mobile-listings');
  await page.evaluate(() => window.scrollTo(0, 400));
  await ss(page, 'mobile-listings-scroll');
  // Mobile header
  await page.screenshot({ path: `${SS}/mobile-header.png`, clip: { x: 0, y: 0, width: 390, height: 70 } });

  await page.goto(`${BASE}/dealer/mgayamotors`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);
  await ss(page, 'mobile-dealer-profile');

  await browser.close();
  console.log('\nDone. Screenshots:', SS);
}

run().catch(e => console.error('[FATAL]', e.message));
