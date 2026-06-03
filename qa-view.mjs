import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:5174';
const SS_DIR = 'D:/qa-screenshots';
fs.mkdirSync(SS_DIR, { recursive: true });

let step = 0;
async function ss(page, name) {
  step++;
  const file = `${SS_DIR}/${String(step).padStart(2,'0')}-${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log(`[SS] ${file}`);
  return file;
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

  // Pre-set location in localStorage to bypass location screen
  await page.goto(BASE);
  await page.evaluate(() => {
    localStorage.setItem('selectedCity', 'Dar es Salaam');
    localStorage.setItem('selectedCountry', 'Tanzania');
    localStorage.setItem('userCity', 'Dar es Salaam');
    localStorage.setItem('userCountry', 'Tanzania');
    localStorage.setItem('locationSet', 'true');
    localStorage.setItem('location', JSON.stringify({ city: 'Dar es Salaam', country: 'Tanzania' }));
  });

  // ── HOME ──────────────────────────────────────────────────────
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await ss(page, 'home');

  // ── DEALERS LIST ──────────────────────────────────────────────
  await page.goto(`${BASE}/dealers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await ss(page, 'dealers-list-top');
  await page.evaluate(() => window.scrollTo(0, 600));
  await ss(page, 'dealers-list-mid');
  await page.evaluate(() => window.scrollTo(0, 1200));
  await ss(page, 'dealers-list-bottom');

  // ── FIRST DEALER PROFILE ──────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 0));
  const dealerLinks = await page.$$eval('a[href*="/dealer/"]', els =>
    els.map(e => ({ href: e.getAttribute('href'), text: e.textContent?.trim().slice(0,40) })).slice(0, 10)
  );
  console.log('[DEALER LINKS]:', dealerLinks);

  if (dealerLinks.length > 0) {
    await page.goto(`${BASE}${dealerLinks[0].href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await ss(page, 'dealer-1-profile-top');
    await page.evaluate(() => window.scrollTo(0, 500));
    await ss(page, 'dealer-1-profile-mid');
    await page.evaluate(() => window.scrollTo(0, 1000));
    await ss(page, 'dealer-1-profile-lower');
    await page.evaluate(() => window.scrollTo(0, 1500));
    await ss(page, 'dealer-1-profile-bottom');
  }

  if (dealerLinks.length > 1) {
    await page.goto(`${BASE}${dealerLinks[1].href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await ss(page, 'dealer-2-profile-top');
    await page.evaluate(() => window.scrollTo(0, 500));
    await ss(page, 'dealer-2-profile-mid');
  }

  if (dealerLinks.length > 2) {
    await page.goto(`${BASE}${dealerLinks[2].href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await ss(page, 'dealer-3-profile-top');
    await page.evaluate(() => window.scrollTo(0, 500));
    await ss(page, 'dealer-3-profile-mid');
  }

  // ── LISTINGS + FILTERS ────────────────────────────────────────
  await page.goto(`${BASE}/cars`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await ss(page, 'listings-top');
  await page.evaluate(() => window.scrollTo(0, 400));
  await ss(page, 'listings-filters');
  await page.evaluate(() => window.scrollTo(0, 800));
  await ss(page, 'listings-cards');
  await page.evaluate(() => window.scrollTo(0, 1200));
  await ss(page, 'listings-cards-lower');

  // ── FIRST CAR DETAIL ─────────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 0));
  const carLink = await page.$('a[href*="/car/"]');
  if (carLink) {
    const href = await carLink.getAttribute('href');
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await ss(page, 'car-detail-top');
    await page.evaluate(() => window.scrollTo(0, 500));
    await ss(page, 'car-detail-mid');
    await page.evaluate(() => window.scrollTo(0, 1000));
    await ss(page, 'car-detail-lower');
  }

  // ── MOBILE ───────────────────────────────────────────────────
  await ctx.setViewportSize({ width: 390, height: 844 });

  await page.goto(`${BASE}/dealers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await ss(page, 'mobile-dealers');

  await page.goto(`${BASE}/cars`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await ss(page, 'mobile-listings');
  await page.evaluate(() => window.scrollTo(0, 400));
  await ss(page, 'mobile-listings-scrolled');

  await browser.close();
  console.log('\nDone. Screenshots at:', SS_DIR);
}

run().catch(e => console.error('[FATAL]', e.message));
