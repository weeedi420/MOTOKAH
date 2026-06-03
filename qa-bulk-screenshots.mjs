/**
 * Bulk page screenshot script — navigates to every dealer + key pages,
 * waits 4s for Instagram CDN images to load, then captures full-page screenshots.
 * Usage: node qa-bulk-screenshots.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:5174';
const OUT = 'D:/qa-bulk';
fs.mkdirSync(OUT, { recursive: true });

// All dealer slugs from the JSON files in src/data/showrooms/
const DEALERS = [
  'mgayamotors','ibaraki','khushimotorsdaressalaam','njari_motors',
  'ruge_magari','fau_motors','tgworldimports','al_husnainmotors',
  'ezy_auto_motors','hanami.japan','barari_motorstz','bongoauto_groups',
  'boxerpoa','breemotors','cholloh_magari_tz','discountmotors_sales',
  'dula_magari','evanamotors','extreme_biketz_','faharimotors_sales',
  'fam_motors_mwanza','fkmotorstanzania','gody_motorstz',
  'amjad_motors_international_ltd','best_truck_tz','_svgmotors',
  'jaja_motors','justin_motors_ltd','kk_magic_cars_','luma_auto_tz',
  'mapigo_saba_magari','msafiri_automobile_expert','ndinga_bei_poa',
  'rwanko_motors','tajirimfupi_magari','tera_automobiles',
];

const KEY_PAGES = [
  { slug: 'home', url: '/' },
  { slug: 'cars-listings', url: '/cars' },
  { slug: 'dealer-directory', url: '/dealers' },
  { slug: 'showroom', url: '/showroom' },
  { slug: 'sell', url: '/sell' },
  { slug: 'duty-calculator', url: '/duty-calculator' },
  { slug: 'blog', url: '/blog' },
  { slug: 'faq', url: '/faq' },
];

async function saveScreenshot(page, slug) {
  const file = path.join(OUT, `${slug}.png`);
  await page.screenshot({ path: file, fullPage: true, timeout: 15000 }).catch(e => {
    console.log(`  [WARN] screenshot failed for ${slug}: ${e.message.slice(0, 60)}`);
  });
  console.log(`  [OK] ${file}`);
}

async function run() {
  const browser = await chromium.launch({
    headless: true, // headless = faster bulk capture
    executablePath: 'C:/Users/rapid/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    geolocation: { latitude: -6.7924, longitude: 39.2083 },
    permissions: ['geolocation'],
    // Bypass location wizard via cookie/storage
  });

  const page = await ctx.newPage();

  // ── Onboarding bypass ──────────────────────────────────────────
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  // Click through wizard fast
  for (let step = 0; step < 4; step++) {
    await page.waitForTimeout(600);
    const tz = await page.$('text=Tanzania');
    if (tz) { await tz.click(); continue; }
    const dar = await page.$('text=Dar es Salaam');
    if (dar) { await dar.click(); continue; }
    const cont = await page.$('button:has-text("Continue"), button:has-text("Done"), button:has-text("Start Exploring")');
    if (cont) { await cont.click(); continue; }
  }
  await page.waitForTimeout(1000);

  // ── Key pages ──────────────────────────────────────────────────
  console.log('\n=== KEY PAGES ===');
  for (const { slug, url } of KEY_PAGES) {
    console.log(`  → ${url}`);
    try {
      await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await page.waitForTimeout(3000); // wait for images
      await saveScreenshot(page, `page-${slug}`);
    } catch (e) {
      console.log(`  [FAIL] ${url}: ${e.message.slice(0, 80)}`);
    }
  }

  // ── Dealer profiles ────────────────────────────────────────────
  console.log('\n=== DEALER PROFILES ===');
  for (const dealer of DEALERS) {
    const url = `/dealer/${dealer}`;
    console.log(`  → ${url}`);
    try {
      await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await page.waitForTimeout(4000); // 4s for Instagram CDN images
      await saveScreenshot(page, `dealer-${dealer}`);
    } catch (e) {
      console.log(`  [FAIL] ${url}: ${e.message.slice(0, 80)}`);
    }
  }

  // ── First 5 car detail pages ───────────────────────────────────
  console.log('\n=== CAR DETAIL PAGES ===');
  await page.goto(`${BASE}/cars`, { waitUntil: 'domcontentloaded', timeout: 12000 });
  await page.waitForTimeout(3000);
  const carLinks = await page.$$eval('a[href*="/car/"]', els =>
    [...new Set(els.map(e => e.getAttribute('href')).filter(Boolean))].slice(0, 5)
  );
  for (const href of carLinks) {
    const slug = href.replace(/\//g, '-').replace(/^-/, '');
    console.log(`  → ${href}`);
    try {
      await page.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await page.waitForTimeout(3000);
      await saveScreenshot(page, `car-${slug}`);
    } catch (e) {
      console.log(`  [FAIL] ${href}: ${e.message.slice(0, 80)}`);
    }
  }

  // ── Mobile view of listings + one dealer ──────────────────────
  console.log('\n=== MOBILE VIEW ===');
  await ctx.setViewportSize({ width: 390, height: 844 });
  for (const { url, slug } of [
    { url: '/', slug: 'home' },
    { url: '/cars', slug: 'cars' },
    { url: '/dealer/mgayamotors', slug: 'dealer-mgaya' },
  ]) {
    await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 12000 });
    await page.waitForTimeout(3000);
    await saveScreenshot(page, `mobile-${slug}`);
  }

  await browser.close();
  console.log(`\n✓ Done — all screenshots in ${OUT}`);
}

run().catch(e => { console.error('[FATAL]', e.message); process.exit(1); });
