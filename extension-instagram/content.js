// ═══════════════════════════════════════════════════════════════
//  Motokah Instagram Scraper — content script
//  Two modes:
//    Feed   — scrapes expanded articles visible in the feed
//    Grid   — clicks each post on hashtag/profile/explore pages,
//             opens the modal, extracts data, then closes and moves on
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const STORAGE_KEY = 'motokah_ig_listings';
  let isRunning = false;
  let stopRequested = false;
  let scrapedCount = 0;

  // ─── Phone extraction ───────────────────────────────────────
  function extractPhones(text) {
    const t = text
      .replace(/[   ​]/g, ' ')
      .replace(/\s+/g, ' ');

    const found = new Set();

    // International +CC format
    (t.match(/\+\d[\d\s\-\.]{9,16}/g) || []).forEach(m => {
      const n = m.replace(/[^\d+]/g, '');
      if (n.length >= 10 && n.length <= 16) found.add(n);
    });

    // Local 0-prefix (0 + 9–11 digits)
    (t.match(/\b0\d[\d\s\-\.]{8,12}\b/g) || []).forEach(m => {
      const n = m.replace(/[^\d]/g, '');
      if (n.length >= 9 && n.length <= 12) found.add(n);
    });

    // After keywords: WhatsApp, call, tel, phone, contact, 📞, 📱
    const kwRe = /(?:whatsapp|call|tel|phone|contact|inbox|reach|ring|📞|📱)\s*:?\s*(\+?[\d][\d\s\-\.\(\)]{8,18})/gi;
    let kw;
    while ((kw = kwRe.exec(t)) !== null) {
      const n = kw[1].replace(/[^\d+]/g, '');
      if (n.length >= 9 && n.length <= 16) found.add(n);
    }

    return [...found].slice(0, 5).join(' | ');
  }

  // ─── Car info from caption ──────────────────────────────────
  const MAKES = [
    'Toyota','Nissan','Honda','Mazda','Subaru','BMW','Mercedes-Benz','Mercedes',
    'Volkswagen','VW','Hyundai','Kia','Mitsubishi','Suzuki','Ford','Isuzu',
    'Land Rover','Range Rover','Lexus','Audi','Chevrolet','Peugeot','Renault',
    'Volvo','Jeep','Tata','Daihatsu','Changan','Faw','Jaguar','Porsche','Mini',
    'Citroen','Hino','Fuso','Datsun','Infiniti','Acura','Cadillac','Chrysler',
    'Dodge','Fiat','GMC','Lincoln','Maserati','Tesla','BYD','Chery','Opel',
    'Skoda','Seat','Alfa Romeo','Bentley','Ferrari','Lamborghini','Rolls-Royce'
  ];

  function parseCarInfo(text) {
    const yearM = text.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
    const year = yearM ? parseInt(yearM[0]) : '';

    let make = '';
    let model = '';
    for (const m of MAKES) {
      if (text.toLowerCase().includes(m.toLowerCase())) {
        make = m === 'Mercedes' ? 'Mercedes-Benz' : (m === 'VW' ? 'Volkswagen' : m);
        break;
      }
    }
    if (make) {
      const after = text.split(new RegExp(make, 'i'))[1] || '';
      const words = after.trim().split(/[\s,\/|]+/).filter(w => w.length > 1 && !/^[#@]/.test(w));
      model = words[0]?.replace(/[^a-zA-Z0-9\-]/g, '') || '';
    }

    let price = '';
    let currency = '';
    const priceM =
      text.match(/(?:KSh|TSh|₦|USh|KES|TZS|NGN|UGX|ZAR|ksh|tsh)\s?[\d,\.]+[kKmM]?/i) ||
      text.match(/[\d,\.]+[kKmM]?\s*(?:KSh|TSh|₦|USh|KES|TZS|NGN|UGX|ZAR|ksh|tsh)/i) ||
      text.match(/(?:price|asking|selling)[:\s]+[\d,\.]+[kKmM]?/i) ||
      text.match(/\$\s?[\d,\.]+[kKmM]?/);
    if (priceM) {
      price = priceM[0];
      if (/KSh|KES|ksh/i.test(price)) currency = 'KES';
      else if (/TSh|TZS|tsh/i.test(price)) currency = 'TZS';
      else if (/₦|NGN/i.test(price)) currency = 'NGN';
      else if (/USh|UGX/i.test(price)) currency = 'UGX';
      else if (/ZAR/i.test(price)) currency = 'ZAR';
      else if (/\$|USD/i.test(price)) currency = 'USD';
    }

    const condM = text.match(/\b(brand[\s-]?new|ex[\s-]?japan|locally used|foreign used|fairly used|clean|accident[\s-]?free|neat)\b/i);
    const condition = condM ? condM[0] : '';

    return { make, model, year, price, currency, condition };
  }

  // ─── Best image URL from srcset/src ─────────────────────────
  function getBestSrc(img) {
    if (!img) return '';
    const srcset = img.getAttribute('srcset') || '';
    if (srcset) {
      const best = srcset.split(',')
        .map(s => { const p = s.trim().split(/\s+/); return { url: p[0], w: parseInt(p[1]) || 0 }; })
        .sort((a, b) => b.w - a.w)[0];
      return best?.url || img.src || '';
    }
    return img.src || '';
  }

  function isContentImage(img) {
    const w = img.naturalWidth || parseInt(img.getAttribute('width') || '0');
    const h = img.naturalHeight || parseInt(img.getAttribute('height') || '0');
    // Exclude tiny avatar icons (< 80px)
    return w > 80 || h > 80;
  }

  // ─── Extract from feed <article> ────────────────────────────
  function extractFromArticle(article) {
    const headerA = article.querySelector('header a[href]:not([href="#"])');
    const username = headerA?.href?.split('instagram.com/')[1]?.replace(/[/?#].*/, '') || '';

    const imgs = [...article.querySelectorAll('img[srcset], img[src*="cdninstagram"]')]
      .filter(isContentImage)
      .map(getBestSrc)
      .filter(Boolean);

    const captionEl =
      article.querySelector('h1') ||
      [...article.querySelectorAll('span[dir="auto"]')].sort((a, b) => b.textContent.length - a.textContent.length)[0] ||
      [...article.querySelectorAll('div[dir="auto"]')].sort((a, b) => b.textContent.length - a.textContent.length)[0];
    const caption = captionEl?.textContent?.trim() || '';

    const postLink = article.querySelector('a[href*="/p/"]') || article.querySelector('a[href*="/reel/"]');
    const postUrl = postLink?.href || location.href;

    return { username, images: imgs, caption, postUrl };
  }

  // ─── Extract from open dialog/modal ─────────────────────────
  function extractFromDialog(dialog) {
    // Username: any profile link inside dialog
    const profileLinks = [...dialog.querySelectorAll('a[href]')].filter(a => {
      const h = a.href || '';
      return h.includes('instagram.com/') &&
        !h.includes('/p/') && !h.includes('/reel/') &&
        !h.includes('/explore') && !h.includes('/accounts') &&
        !h.endsWith('instagram.com/');
    });
    const username = profileLinks[0]?.href?.split('instagram.com/')[1]?.replace(/[/?#].*/, '') || '';

    const imgs = [...dialog.querySelectorAll('img[srcset], img[src*="cdninstagram"]')]
      .filter(isContentImage)
      .map(getBestSrc)
      .filter(Boolean);

    const captionEl =
      dialog.querySelector('h1') ||
      [...dialog.querySelectorAll('span[dir="auto"]')].sort((a, b) => b.textContent.length - a.textContent.length)[0] ||
      [...dialog.querySelectorAll('div[dir="auto"]')].sort((a, b) => b.textContent.length - a.textContent.length)[0];
    const caption = captionEl?.textContent?.trim() || '';

    return { username, images: imgs, caption, postUrl: location.href };
  }

  // ─── Build storage row ──────────────────────────────────────
  function buildRow({ username, images, caption, postUrl }) {
    const { make, model, year, price, currency, condition } = parseCarInfo(caption);
    // Extract shortcode from URL: /p/SHORTCODE/ or /reel/SHORTCODE/
    const shortcodeMatch = postUrl.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : '';
    return {
      username,
      post_url: postUrl,
      shortcode,
      image_1: images[0] || '',
      image_2: images[1] || '',
      image_3: images[2] || '',
      images_all: images.slice(0, 8).join(' | '),
      images,  // full array for JSON export
      make, model, year, price, currency, condition,
      phones: extractPhones(caption),
      caption: caption.replace(/\n+/g, ' ').slice(0, 800),
      source: 'instagram',
      scraped_at: new Date().toISOString()
    };
  }

  // ─── Persist row (deduplicated by post_url) ─────────────────
  function saveRow(row) {
    return new Promise(resolve => {
      chrome.storage.local.get([STORAGE_KEY], res => {
        const list = res[STORAGE_KEY] || [];
        if (!list.some(r => r.post_url === row.post_url)) {
          list.push(row);
          chrome.storage.local.set({ [STORAGE_KEY]: list }, () => resolve(list.length));
        } else {
          resolve(list.length);
        }
      });
    });
  }

  // ─── Helpers ────────────────────────────────────────────────
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function jitter(base, spread = 0.4) {
    return base + Math.floor(Math.random() * base * spread);
  }

  function waitForEl(selector, timeout = 6000, root = document) {
    return new Promise(resolve => {
      const el = root.querySelector(selector);
      if (el) { resolve(el); return; }
      const obs = new MutationObserver(() => {
        const found = root.querySelector(selector);
        if (found) { obs.disconnect(); resolve(found); }
      });
      obs.observe(root, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); resolve(null); }, timeout);
    });
  }

  function waitForGone(selector, timeout = 5000) {
    return new Promise(resolve => {
      if (!document.querySelector(selector)) { resolve(); return; }
      const obs = new MutationObserver(() => {
        if (!document.querySelector(selector)) { obs.disconnect(); resolve(); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); resolve(); }, timeout);
    });
  }

  // ─── UI helpers ─────────────────────────────────────────────
  function setStatus(t) { const el = document.getElementById('mig-status'); if (el) el.textContent = t; }
  function setCount(n) { const el = document.getElementById('mig-count'); if (el) el.textContent = `${n} scraped`; }

  // ─── MODE 1: Feed scraper ────────────────────────────────────
  async function scrapeFeed() {
    setStatus('Scanning feed...');
    const seen = new Set();
    let stuck = 0;
    let lastCount = 0;

    while (!stopRequested) {
      for (const article of document.querySelectorAll('article')) {
        if (stopRequested) break;
        const data = extractFromArticle(article);
        if (!data.postUrl || seen.has(data.postUrl)) continue;
        if (!data.images.length && !data.caption) continue;
        seen.add(data.postUrl);
        const row = buildRow(data);
        await saveRow(row);
        scrapedCount++;
        setCount(scrapedCount);
        setStatus(`Saved: @${row.username || '?'} | ${row.make || 'car'}`);
        chrome.runtime.sendMessage({ action: 'count_update', count: scrapedCount });
      }

      window.scrollBy({ top: window.innerHeight * 1.5, behavior: 'smooth' });
      await sleep(jitter(2800));

      if (scrapedCount === lastCount) {
        stuck++;
        if (stuck > 8) { setStatus('Feed exhausted. Done!'); break; }
      } else {
        stuck = 0;
      }
      lastCount = scrapedCount;
    }
  }

  // ─── MODE 2: Grid scraper (hashtag / profile / explore) ─────
  async function scrapeGrid() {
    setStatus('Starting grid scan...');
    await sleep(2000);

    const scrapedUrls = new Set();
    let noNewCount = 0;

    while (!stopRequested) {
      // Collect only image post links — exclude reels entirely
      const links = [...document.querySelectorAll('a[href*="/p/"]')]
        .filter(a => !scrapedUrls.has(a.href) && a.href && !a.href.endsWith('#'))
        .filter(a => {
          // Skip if the grid tile has a reel/video indicator overlay
          const tile = a.closest('div[style], li, div._aagw, div._aabd') || a.parentElement;
          const hasVideoIcon = tile?.querySelector('svg[aria-label*="Reel"], svg[aria-label*="Video"], [class*="reel"]');
          return !hasVideoIcon;
        });

      if (links.length === 0) {
        window.scrollBy({ top: window.innerHeight * 2, behavior: 'smooth' });
        await sleep(jitter(3000));
        noNewCount++;
        if (noNewCount > 6) { setStatus('No more posts. Done!'); break; }
        continue;
      }

      noNewCount = 0;

      for (const link of links) {
        if (stopRequested) break;

        const href = link.href;
        scrapedUrls.add(href);

        setStatus(`Opening post ${scrapedUrls.size}...`);
        link.click();

        // Wait for dialog to appear
        const dialog = await waitForEl('div[role="dialog"]', 7000);
        if (!dialog) {
          setStatus('Dialog timed out, skipping...');
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          await sleep(800);
          continue;
        }

        await sleep(jitter(1500)); // let content fully load

        // Collect images from carousel slides
        const allImages = new Set();
        let carouselTries = 0;

        while (carouselTries < 12) {
          const fresh = extractFromDialog(dialog);
          fresh.images.forEach(u => allImages.add(u));

          const nextBtn = dialog.querySelector(
            'button[aria-label*="Next"], button[aria-label*="next"], ' +
            '[aria-label="Next"], [aria-label="next"]'
          );
          if (!nextBtn) break;
          nextBtn.click();
          await sleep(jitter(700));
          carouselTries++;
        }

        // Final extraction with merged images
        const data = extractFromDialog(dialog);
        data.images = [...allImages];
        data.postUrl = href;

        const row = buildRow(data);
        await saveRow(row);
        scrapedCount++;
        setCount(scrapedCount);
        setStatus(`Saved: @${row.username || '?'} | ${row.make || '—'} | ${row.phones || 'no phone'}`);
        chrome.runtime.sendMessage({ action: 'count_update', count: scrapedCount });

        // Close modal
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        await waitForGone('div[role="dialog"]', 4000);
        await sleep(jitter(1200));
      }
    }
  }

  // ─── Inject floating UI ──────────────────────────────────────
  function injectUI() {
    if (document.getElementById('mig-root')) return;
    const root = document.createElement('div');
    root.id = 'mig-root';
    root.innerHTML = `
      <div id="mig-header">
        <span>📸</span> Motokah IG
        <span id="mig-collapse" style="float:right;cursor:pointer;opacity:0.6">▾</span>
      </div>
      <div id="mig-body">
        <div id="mig-status">Ready</div>
        <div id="mig-count">0 scraped</div>
        <div class="mig-row">
          <label class="mig-label">Mode</label>
          <select id="mig-mode">
            <option value="feed">Feed (scroll)</option>
            <option value="grid">Grid (click each post)</option>
          </select>
        </div>
        <div id="mig-hint" class="mig-hint">Scroll your feed — scrapes what's visible.</div>
        <button id="mig-run">▶ Start Scraping</button>
        <button id="mig-stop" style="display:none">■ Stop</button>
      </div>
    `;
    const target = document.body || document.documentElement;
    target.appendChild(root);
  }

  // ─── Main ────────────────────────────────────────────────────
  function main() {
    if (!location.hostname.includes('instagram.com')) return;

    injectUI();

    // Wait one tick for DOM insertion
    setTimeout(() => {
      const runBtn  = document.getElementById('mig-run');
      const stopBtn = document.getElementById('mig-stop');
      const modeEl  = document.getElementById('mig-mode');
      const hintEl  = document.getElementById('mig-hint');
      const bodyEl  = document.getElementById('mig-body');
      const colBtn  = document.getElementById('mig-collapse');

      if (!runBtn) return;

      const HINTS = {
        feed: 'Scroll your feed — scrapes visible articles.',
        grid: 'Navigates to each post in the grid, opens it, extracts data & phone.'
      };

      modeEl?.addEventListener('change', () => {
        if (hintEl) hintEl.textContent = HINTS[modeEl.value] || '';
      });

      colBtn?.addEventListener('click', () => {
        const collapsed = bodyEl.style.display === 'none';
        bodyEl.style.display = collapsed ? 'block' : 'none';
        colBtn.textContent = collapsed ? '▾' : '▸';
      });

      runBtn.addEventListener('click', async () => {
        if (isRunning) return;
        isRunning = true;
        stopRequested = false;
        runBtn.style.display = 'none';
        stopBtn.style.display = 'block';

        // Load existing count
        const res = await new Promise(r => chrome.storage.local.get([STORAGE_KEY], r));
        scrapedCount = (res[STORAGE_KEY] || []).length;
        setCount(scrapedCount);

        const mode = modeEl?.value || 'feed';
        if (mode === 'grid') {
          await scrapeGrid();
        } else {
          await scrapeFeed();
        }

        isRunning = false;
        stopRequested = false;
        runBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        setStatus(`Done! ${scrapedCount} total. Download from popup.`);
      });

      stopBtn.addEventListener('click', () => {
        stopRequested = true;
        setStatus('Stopping after current post...');
      });

      // Auto-resume grid mode if we were redirected by popup hashtag button
      chrome.storage.local.get(['motokah_ig_auto_grid'], result => {
        if (result.motokah_ig_auto_grid) {
          chrome.storage.local.remove('motokah_ig_auto_grid');
          if (modeEl) modeEl.value = 'grid';
          if (hintEl) hintEl.textContent = HINTS.grid;
          setTimeout(() => runBtn?.click(), 3500);
        }
      });

      // Sync count from storage on load
      chrome.storage.local.get([STORAGE_KEY], r => {
        scrapedCount = (r[STORAGE_KEY] || []).length;
        setCount(scrapedCount);
      });
    }, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
