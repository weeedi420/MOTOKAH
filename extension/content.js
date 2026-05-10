// ═══════════════════════════════════════════════════════════════
//  Motokah Scraper — FULLY AUTOMATED, BULLETPROOF Content Script
//  Injects UI first. Auto-runs if enabled. Closes old tabs.
//  Minimum 60s runtime. Chains through ALL URLs until done.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── 1. Inject UI FIRST ─────────────────────────────────────
  function injectUI() {
    if (document.getElementById('motokah-root')) return;
    const root = document.createElement('div');
    root.id = 'motokah-root';
    root.className = 'motokah-float';
    root.innerHTML = `
      <div class="motokah-badge" id="motokah-status">Loading...</div>
      <div class="motokah-badge" id="motokah-count">0 / 5000</div>
      <button class="motokah-btn motokah-btn-scrape" id="motokah-run">🚀 Auto Scrape 5000</button>
      <button class="motokah-btn motokah-btn-auto" id="motokah-next">⏭ Skip to Next</button>
    `;
    if (document.body) {
      document.body.appendChild(root);
    } else {
      document.addEventListener('DOMContentLoaded', () => document.body.appendChild(root));
    }
  }

  injectUI();

  // ─── 2. Wait for body then run main logic ───────────────────
  function main() {
    const host = location.host;
    if (!host.includes('jiji')) return;

    const statusEl = document.getElementById('motokah-status');
    const countEl = document.getElementById('motokah-count');
    const runBtn = document.getElementById('motokah-run');
    const skipBtn = document.getElementById('motokah-next');

    if (!statusEl || !runBtn) return;

    function setStatus(text) { statusEl.textContent = text; }
    function setCount(n) { countEl.textContent = `${n} / 5000`; }

    const TARGET = 5000;
    const MIN_RUNTIME_MS = 60000;
    const STUCK_LIMIT = 15;
    let isRunning = false;

    try { chrome.runtime.sendMessage({ action: 'register_tab' }); } catch (e) {}

    // ─── Better scroll that triggers lazy load ──────────────────
    async function smartScroll() {
      const step = window.innerHeight * 0.7;
      let currentY = window.scrollY;
      const maxY = document.body.scrollHeight - window.innerHeight;

      if (currentY >= maxY - 100) {
        // Already near bottom — scroll up a bit then back down to trigger
        window.scrollTo({ top: Math.max(0, currentY - step * 2), behavior: 'smooth' });
        await sleep(800);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        await sleep(1200);
      } else {
        window.scrollTo({ top: currentY + step, behavior: 'smooth' });
        await sleep(1200);
      }
    }

    function countItems() {
      // Count all listing cards on page
      return document.querySelectorAll('.b-list-advert-base, [class*="advert-base"], a[href*="/item/"]').length;
    }

    function clickLoadMore() {
      const btn = document.querySelector('button[class*="load-more"], button[class*="show-more"], .qa-load-more, [data-testid="load-more"]');
      if (btn && !btn.disabled) {
        btn.click();
        return true;
      }
      return false;
    }

    // ─── Scraping helpers ───────────────────────────────────────
    function scrapeVisible() {
      const listings = [];
      const seen = new Set();

      document.querySelectorAll('.b-list-advert-base, [class*="advert-base"]').forEach(card => {
        try {
          const titleEl = card.querySelector('.b-list-advert-base__data__title, [class*="title"]');
          const priceEl = card.querySelector('.b-list-advert-base__data__price, [class*="price"]');
          const imgEl   = card.querySelector('img');
          const locEl   = card.querySelector('.b-list-advert-base__data__location, [class*="location"]');
          const linkEl  = card.querySelector('a[href*="/item/"]') || card.closest('a[href*="/item/"]');

          const title = titleEl?.textContent?.trim() || '';
          if (!title || seen.has(title)) return;
          seen.add(title);

          const priceText = priceEl?.textContent?.trim() || '';
          const price = parsePrice(priceText);
          const currency = priceText.includes('KSh') ? 'KES' : (priceText.includes('₦') ? 'NGN' : (priceText.includes('USh') ? 'UGX' : 'TZS'));
          const location = locEl?.textContent?.trim() || '';
          const imageUrl = imgEl?.src || imgEl?.dataset?.src || '';
          const link = linkEl?.href ? normalizeUrl(linkEl.href) : '';

          const { make, model, year } = parseTitle(title);
          listings.push(buildRow(title, make, model, year, price, currency, location, imageUrl, link));
        } catch (e) {}
      });

      // Fallback
      if (listings.length === 0) {
        document.querySelectorAll('a[href*="/item/"]').forEach(link => {
          try {
            const card = link.closest('div[class*="advert"]') || link;
            const title = card.textContent?.match(/^[^\n\r]{10,80}/)?.[0]?.trim();
            if (!title || seen.has(title)) return;
            seen.add(title);
            const priceMatch = card.textContent?.match(/(TSh|KSh|₦|USh)\s?[\d,]+/);
            const price = priceMatch ? parsePrice(priceMatch[0]) : 0;
            let currency = 'TZS';
            if (card.textContent.includes('KSh')) currency = 'KES';
            else if (card.textContent.includes('₦')) currency = 'NGN';
            else if (card.textContent.includes('USh')) currency = 'UGX';
            const img = card.querySelector('img');
            const { make, model, year } = parseTitle(title);
            listings.push(buildRow(title, make, model, year, price, currency, '', img?.src || '', normalizeUrl(link.href)));
          } catch (e) {}
        });
      }

      return listings;
    }

    function normalizeUrl(href) {
      try { return new URL(href, location.origin).href; } catch { return href; }
    }

    function parsePrice(text) {
      const num = text.replace(/[^\d]/g, '');
      return num ? parseInt(num, 10) : 0;
    }

    function parseTitle(title) {
      const yearMatch = title.match(/\b(19|20)\d{2}\b/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : null;

      const commonMakes = ['Toyota','Nissan','Honda','Mazda','Subaru','BMW','Mercedes-Benz','Mercedes','Volkswagen','Hyundai','Kia','Mitsubishi','Suzuki','Ford','Isuzu','Land Rover','Lexus','Audi','Chevrolet','Peugeot','Renault','Volvo','Jeep','Tata','Daihatsu','Changan','Faw','Jaguar','Porsche','Mini','Citroen','Scania','Man','Hino','Fuso','Datsun','Infiniti','Acura','Cadillac','Chrysler','Dodge','Fiat','GMC','Holden','Lincoln','Maserati','Tesla','BYD','Chery','Mikano'];
      let make = '';
      for (const m of commonMakes) {
        if (title.toLowerCase().includes(m.toLowerCase())) {
          make = m === 'mercedes' ? 'Mercedes-Benz' : m;
          break;
        }
      }

      let model = '';
      if (make) {
        const after = title.split(new RegExp(make, 'i'))[1] || '';
        const words = after.trim().split(/\s+/).filter(w => w.length > 1);
        model = words[0]?.replace(/[^a-zA-Z0-9\-]/g, '') || '';
      }
      if (!model) {
        const words = title.split(/\s+/).filter(w => w.length > 2 && !/^\d{4}$/.test(w));
        model = words[1] || words[0] || '';
      }

      return { make, model, year };
    }

    function buildRow(title, make, model, year, price, currency, location, imageUrl, link) {
      return {
        title, make, model, year,
        price, currency, location,
        image_url: imageUrl,
        source_url: link,
        condition: 'Used',
        source: 'jiji',
        scraped_at: new Date().toISOString()
      };
    }

    // ─── Core loop ──────────────────────────────────────────────
    async function autoScrape() {
      if (isRunning) return;
      isRunning = true;
      runBtn.disabled = true;
      runBtn.textContent = '⏳ Running...';

      const scrapedOnThisPage = [];
      let lastTotalItems = 0;
      let stuckCount = 0;
      const startTime = Date.now();

      while (scrapedOnThisPage.length < TARGET) {
        const elapsed = Date.now() - startTime;
        const canQuit = elapsed > MIN_RUNTIME_MS;

        // Scroll incrementally to trigger lazy load
        await smartScroll();
        setStatus(`Loading... ${scrapedOnThisPage.length} scraped`);

        // Try clicking load-more button if exists
        if (clickLoadMore()) {
          await sleep(2000);
        }

        // Count total items on page
        const totalItems = countItems();
        setStatus(`Items on page: ${totalItems} | Scraped: ${scrapedOnThisPage.length}`);

        // Scrape visible
        const batch = scrapeVisible();
        const newItems = batch.filter(b => !scrapedOnThisPage.some(s => s.title === b.title));

        if (newItems.length > 0) {
          scrapedOnThisPage.push(...newItems);
          stuckCount = 0;
          setCount(scrapedOnThisPage.length);
          setStatus(`Scraped ${scrapedOnThisPage.length} | Page items: ${totalItems}`);
        } else {
          stuckCount++;
          if (canQuit && stuckCount >= STUCK_LIMIT) {
            setStatus(`No new items after ${Math.round(elapsed/1000)}s. Stopping.`);
            break;
          }
          setStatus(`No new (${stuckCount}/${canQuit ? STUCK_LIMIT : 'wait'}) | ${Math.round(elapsed/1000)}s | Page: ${totalItems}`);
        }

        if (totalItems === lastTotalItems) {
          stuckCount++;
          if (canQuit && stuckCount >= STUCK_LIMIT) {
            setStatus(`Page dry. ${scrapedOnThisPage.length} cars total.`);
            break;
          }
          // Scroll back up then down to re-trigger
          window.scrollTo({ top: Math.max(0, window.scrollY - window.innerHeight * 3), behavior: 'smooth' });
          await sleep(1000);
        }
        lastTotalItems = totalItems;
      }

      setStatus(`Done! ${scrapedOnThisPage.length} cars. Saving...`);

      chrome.runtime.sendMessage(
        { action: 'save_listings', listings: scrapedOnThisPage },
        (saveRes) => {
          if (chrome.runtime.lastError) {
            setStatus('Save error: ' + chrome.runtime.lastError.message);
            isRunning = false;
            runBtn.disabled = false;
            runBtn.textContent = '🚀 Auto Scrape 5000';
            return;
          }

          setStatus(`Saved ${saveRes.saved}. Next URL...`);

          chrome.runtime.sendMessage(
            { action: 'next_url' },
            (nextRes) => {
              if (nextRes.done) {
                setStatus('All URLs done! 🎉');
                runBtn.textContent = '✅ Finished';
              }
            }
          );
        }
      );
    }

    function sleep(ms) {
      return new Promise(r => setTimeout(r, ms));
    }

    // ─── Buttons ────────────────────────────────────────────────
    runBtn.addEventListener('click', autoScrape);
    skipBtn.addEventListener('click', () => {
      setStatus('Skipping...');
      chrome.runtime.sendMessage({ action: 'next_url' });
    });

    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 's') { e.preventDefault(); runBtn.click(); }
      if (e.altKey && e.key === 'n') { e.preventDefault(); skipBtn.click(); }
    });

    // ─── AUTO-RUN ───────────────────────────────────────────────
    setStatus('Checking auto-run...');

    chrome.storage.local.get(['motokah_auto_run', 'motokah_queue', 'motokah_current'], (result) => {
      if (!result.motokah_auto_run) {
        setStatus('Ready — Alt+S run, Alt+N skip');
        return;
      }

      const queue = result.motokah_queue || [];
      const currentIdx = result.motokah_current || 0;
      const currentUrl = queue[currentIdx];

      if (!currentUrl) {
        setStatus('Queue empty');
        return;
      }

      let pageHost = location.hostname.replace('www.', '');
      let expectedHost = '';
      try {
        expectedHost = new URL(currentUrl).hostname.replace('www.', '');
      } catch (e) {
        expectedHost = currentUrl.replace(/^https?:\/\//, '').split('/')[0].replace('www.', '');
      }

      const isMatch = pageHost === expectedHost ||
        (expectedHost && pageHost.includes(expectedHost.replace(/^www\./, ''))) ||
        (pageHost.includes('jiji') && expectedHost.includes('jiji'));

      if (isMatch) {
        setStatus('Auto-run in 3s...');
        runBtn.textContent = '⏳ Auto starting...';
        runBtn.disabled = true;
        setTimeout(() => {
          autoScrape();
        }, 3000);
      } else {
        setStatus('Ready — Alt+S run, Alt+N skip');
      }
    });
  }

  // ─── Error safety net ───────────────────────────────────────
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', main);
    } else {
      main();
    }
  } catch (err) {
    console.error('Motokah scraper error:', err);
    const fb = document.createElement('div');
    fb.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;background:#7f1d1d;color:#fff;padding:12px;border-radius:8px;font-family:sans-serif;font-size:13px;';
    fb.textContent = 'Motokah error: ' + err.message;
    document.body?.appendChild(fb);
  }
})();
