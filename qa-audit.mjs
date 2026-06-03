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
    slowMo: 200,
    executablePath: 'C:/Users/rapid/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'
  });
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    // Grant geolocation but set to Dar es Salaam coords
    geolocation: { latitude: -6.7924, longitude: 39.2083 },
    permissions: ['geolocation']
  });
  const page = await ctx.newPage();

  // ── 1. LOCATION ONBOARDING BUG ───────────────────────────────
  console.log('\n=== BUG: LOCATION DETECTION SCREEN ===');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // wait for location detection
  await ss(page, 'BUG-location-detection-screen');

  // Check if still stuck
  const spinnerVisible = await page.isVisible('text=Detecting your location');
  console.log('[BUG] Location spinner still showing after 3s:', spinnerVisible);

  // Click "Select your country Change" to bypass
  const selectBtn = await page.$('button:has-text("Select your country")');
  if (selectBtn) {
    console.log('[ACTION] Clicking Select your country button');
    await selectBtn.click();
    await page.waitForTimeout(1000);
    await ss(page, 'after-select-country-click');
  }

  // ── 2. COUNTRY/CITY SELECTOR MODAL ───────────────────────────
  console.log('\n=== COUNTRY/CITY SELECTOR ===');
  await page.waitForTimeout(1000);
  await ss(page, 'country-selector-modal');

  // Try clicking Tanzania
  const tanzania = await page.$('text=Tanzania');
  if (tanzania) {
    await tanzania.click();
    await page.waitForTimeout(800);
    await ss(page, 'after-tanzania-click');

    // Try clicking Dar es Salaam
    const dares = await page.$('text=Dar es Salaam');
    if (dares) {
      await dares.click();
      await page.waitForTimeout(800);
      await ss(page, 'after-dar-es-salaam-click');
    }
  } else {
    console.log('[BUG] No Tanzania option found');
    const options = await page.$$eval('button, [role="option"], li', els =>
      els.map(e => e.textContent?.trim()).filter(Boolean).slice(0, 30)
    );
    console.log('[OPTIONS]:', options);
    await ss(page, 'country-options-debug');
  }

  // Confirm/proceed
  const confirmBtn = await page.$('button:has-text("Confirm"), button:has-text("Continue"), button:has-text("Go"), button:has-text("Done"), button:has-text("Apply")');
  if (confirmBtn) {
    await confirmBtn.click();
    await page.waitForTimeout(1000);
    await ss(page, 'after-confirm');
  }

  // ── 3. MAIN APP AFTER LOCATION SET ───────────────────────────
  console.log('\n=== MAIN APP ===');
  await page.waitForTimeout(2000);
  await ss(page, 'main-app-home');
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(500);
  await ss(page, 'main-app-home-scrolled');
  await page.evaluate(() => window.scrollTo(0, 900));
  await ss(page, 'main-app-home-bottom');

  // ── 4. LOCATION CHANGE TEST ───────────────────────────────────
  console.log('\n=== LOCATION CHANGE TEST ===');
  await page.evaluate(() => window.scrollTo(0, 0));
  // Find location display in header/navbar
  const allText = await page.$$eval('header *, nav *, [class*="header"] *', els =>
    els.map(e => ({ tag: e.tagName, text: e.textContent?.trim().slice(0, 50), class: e.className?.toString().slice(0,40) }))
       .filter(e => e.text && e.text.length > 0)
       .slice(0, 30)
  );
  console.log('[HEADER ELEMENTS]:', JSON.stringify(allText, null, 2));
  await ss(page, 'header-closeup');

  // Try to change location
  const locationInHeader = await page.$('header button, nav button, [class*="location"], [class*="city"]');
  if (locationInHeader) {
    await locationInHeader.click();
    await page.waitForTimeout(800);
    await ss(page, 'location-change-dropdown');

    // Try changing to Kenya/Nairobi
    const kenya = await page.$('text=Kenya');
    if (kenya) {
      await kenya.click();
      await page.waitForTimeout(500);
      await ss(page, 'kenya-selected');
      const nairobi = await page.$('text=Nairobi');
      if (nairobi) {
        await nairobi.click();
        await page.waitForTimeout(500);
        await ss(page, 'nairobi-selected');
      }
    } else {
      console.log('[BUG] Kenya not found in location change dropdown');
      await ss(page, 'location-change-contents');
    }
  }

  // ── 5. LISTINGS PAGE + FILTERS ───────────────────────────────
  console.log('\n=== LISTINGS + FILTERS ===');
  // Navigate to listings
  const carsLink = await page.$('a[href*="/cars"], a[href*="/listings"], nav a:has-text("Cars"), nav a:has-text("Browse")');
  if (carsLink) {
    await carsLink.click();
  } else {
    await page.goto(`${BASE}/cars`, { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(2000);
  await ss(page, 'listings-page-full');
  await page.evaluate(() => window.scrollTo(0, 0));
  await ss(page, 'listings-page-top');

  // Scroll to filters
  await page.evaluate(() => window.scrollTo(0, 300));
  await ss(page, 'listings-filters-area');

  // Find all filter controls
  const filterControls = await page.$$eval(
    'select, input[type="text"], input[type="search"], input[type="number"], [role="combobox"], [role="listbox"], button[class*="filter"], [class*="filter"] button',
    els => els.map(e => ({
      tag: e.tagName, type: e.type, placeholder: e.placeholder,
      value: e.value, text: e.textContent?.trim().slice(0,30)
    }))
  );
  console.log('[FILTER CONTROLS]:', JSON.stringify(filterControls, null, 2));
  await ss(page, 'listings-filter-controls');

  // Try interacting with first combobox/select
  const firstCombo = await page.$('[role="combobox"], select');
  if (firstCombo) {
    await firstCombo.click();
    await page.waitForTimeout(500);
    await ss(page, 'filter-combobox-open');
    await page.keyboard.press('Escape');
  }

  // ── 6. LISTING CARDS - CHECK PRICES & IMAGES ─────────────────
  console.log('\n=== LISTING CARDS AUDIT ===');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Find all listing cards
  const cards = await page.$$('[class*="card"], [class*="listing"], [class*="vehicle-card"], [class*="car-card"]');
  console.log(`[CARDS] Found: ${cards.length}`);

  // Check each card for price and image
  const cardData = await page.$$eval(
    'a[href*="/car/"], a[href*="/listing/"], [class*="VehicleCard"], [class*="vehicle-card"], [class*="car-card"]',
    els => els.slice(0, 10).map(el => ({
      hasPrice: !!el.querySelector('[class*="price"], [class*="Price"]') ||
                /KSh|TZS|USD|\$|\/=/.test(el.textContent || ''),
      hasImage: !!el.querySelector('img'),
      imgSrc: el.querySelector('img')?.src?.slice(0, 80) || 'NO IMAGE',
      text: el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 100),
      href: el.href || 'no href'
    }))
  );
  console.log('[CARD DATA]:');
  cardData.forEach((c, i) => {
    console.log(`  Card ${i+1}: price=${c.hasPrice}, img=${c.hasImage}, src=${c.imgSrc.slice(0,60)}`);
    if (!c.hasPrice) console.log(`    [BUG] Card ${i+1} HAS NO PRICE`);
  });

  // Screenshot cards
  await ss(page, 'listing-cards-top');
  await page.evaluate(() => window.scrollTo(0, 500));
  await ss(page, 'listing-cards-mid');
  await page.evaluate(() => window.scrollTo(0, 1000));
  await ss(page, 'listing-cards-lower');
  await page.evaluate(() => window.scrollTo(0, 1500));
  await ss(page, 'listing-cards-bottom');

  // ── 7. DETAIL PAGE ───────────────────────────────────────────
  console.log('\n=== DETAIL PAGE ===');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const firstListing = await page.$('a[href*="/car/"], a[href*="/listing/"]');
  if (firstListing) {
    const href = await firstListing.getAttribute('href');
    console.log('[DETAIL] href:', href);
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await ss(page, 'detail-page-top');
    await page.evaluate(() => window.scrollTo(0, 500));
    await ss(page, 'detail-page-mid');
    await page.evaluate(() => window.scrollTo(0, 1000));
    await ss(page, 'detail-page-lower');

    // Test text copy
    await page.evaluate(() => document.execCommand('selectAll'));
    await page.waitForTimeout(300);
    const selLen = await page.evaluate(() => window.getSelection()?.toString().length || 0);
    console.log(`[COPY TEST] selectAll got ${selLen} chars — ${selLen > 0 ? 'COPY WORKS' : 'BUG: COPY BLOCKED'}`);
  }

  // ── 8. DEALER PROFILE ────────────────────────────────────────
  console.log('\n=== DEALER PROFILE ===');
  await page.goto(`${BASE}/dealers`, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(e => console.log('[ROUTE] /dealers:', e.message));
  await page.waitForTimeout(1500);
  await ss(page, 'dealers-page');

  const firstDealer = await page.$('a[href*="/dealer/"]');
  if (firstDealer) {
    const href = await firstDealer.getAttribute('href');
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await ss(page, 'dealer-profile-top');
    await page.evaluate(() => window.scrollTo(0, 500));
    await ss(page, 'dealer-profile-mid');
  }

  // ── 9. INSTAGRAM SHOWROOM ─────────────────────────────────────
  console.log('\n=== INSTAGRAM SHOWROOM ===');
  await page.goto(`${BASE}/showroom`, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(e => console.log('[ROUTE] /showroom:', e.message));
  await page.waitForTimeout(1500);
  await ss(page, 'showroom-page');
  await page.evaluate(() => window.scrollTo(0, 600));
  await ss(page, 'showroom-mid');

  // ── 10. MOBILE VIEW ──────────────────────────────────────────
  console.log('\n=== MOBILE VIEW ===');
  await ctx.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/cars`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await ss(page, 'mobile-listings');
  await page.evaluate(() => window.scrollTo(0, 400));
  await ss(page, 'mobile-listings-scrolled');

  // Back to home mobile
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await ss(page, 'mobile-home');

  // ── 11. ALL ROUTES SMOKE TEST ────────────────────────────────
  console.log('\n=== ROUTES SMOKE TEST ===');
  await ctx.setViewportSize({ width: 1400, height: 900 });
  const routes = ['/', '/cars', '/dealers', '/showroom', '/about', '/contact', '/blog', '/sell', '/duty-calculator', '/faq'];
  for (const route of routes) {
    try {
      const resp = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 6000 });
      await page.waitForTimeout(500);
      const status = resp?.status() || '?';
      const hasError = await page.isVisible('text=404') || await page.isVisible('text=not found') || await page.isVisible('text=Error');
      console.log(`[ROUTE] ${route} → HTTP ${status} | 404-error: ${hasError}`);
      if (hasError) await ss(page, `route-error${route.replace(/\//g, '-')}`);
    } catch(e) {
      console.log(`[ROUTE ERROR] ${route}: ${e.message.slice(0,60)}`);
    }
  }

  await browser.close();
  console.log('\n=== AUDIT COMPLETE. Screenshots:', SS_DIR);
}

run().catch(e => { console.error('\n[FATAL]', e.message); process.exit(1); });
