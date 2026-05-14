// ── Popup logic for Motokah Instagram Scraper ────────────────

const STORAGE_KEY = 'motokah_ig_listings';

function showStatus(msg, ms = 3000) {
  const el = document.getElementById('statusMsg');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  if (ms > 0) setTimeout(() => el.classList.remove('show'), ms);
}

function updateStats() {
  chrome.storage.local.get([STORAGE_KEY], result => {
    const listings = result[STORAGE_KEY] || [];
    document.getElementById('totalCount').textContent = listings.length;
    const withPhone = listings.filter(r => r.phones && r.phones.trim().length > 0).length;
    document.getElementById('phoneCount').textContent = withPhone;
  });
}

// ─── Navigation helpers ──────────────────────────────────────
function openHashtag(tag) {
  const clean = tag.replace(/^[#@\s]+/, '').trim();
  if (!clean) return;

  // Detect if input looks like a username (no spaces, used with @)
  const isUsername = tag.startsWith('@') || (!tag.startsWith('#') && !clean.includes(' '));
  const url = isUsername
    ? `https://www.instagram.com/${clean}/`
    : `https://www.instagram.com/explore/tags/${encodeURIComponent(clean)}/`;

  // Set auto-grid flag so content.js picks up and auto-starts
  chrome.storage.local.set({ motokah_ig_auto_grid: true }, () => {
    chrome.tabs.query({ url: '*://www.instagram.com/*' }, tabs => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { url, active: true });
      } else {
        chrome.tabs.create({ url });
      }
    });
  });
}

// ─── CSV download ────────────────────────────────────────────
function downloadCSV() {
  chrome.storage.local.get([STORAGE_KEY], result => {
    const listings = result[STORAGE_KEY] || [];
    if (!listings.length) { showStatus('No data scraped yet.'); return; }

    const HEADERS = [
      'username', 'post_url',
      'make', 'model', 'year', 'price', 'currency', 'condition',
      'phones',
      'image_1', 'image_2', 'image_3',
      'caption',
      'source', 'scraped_at'
    ];

    const rows = [HEADERS.join(',')];
    listings.forEach(r => {
      rows.push(HEADERS.map(h => {
        let v = String(r[h] ?? '');
        if (v.includes(',') || v.includes('"') || v.includes('\n')) {
          v = '"' + v.replace(/"/g, '""') + '"';
        }
        return v;
      }).join(','));
    });

    const blob = new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `motokah_instagram_${today()}.csv`);
    showStatus(`Downloaded ${listings.length} rows.`);
  });
}

// ─── JSON download ───────────────────────────────────────────
function downloadJSON() {
  chrome.storage.local.get([STORAGE_KEY], result => {
    const listings = result[STORAGE_KEY] || [];
    if (!listings.length) { showStatus('No data scraped yet.'); return; }
    const blob = new Blob([JSON.stringify(listings, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `motokah_instagram_${today()}.json`);
    showStatus(`Downloaded ${listings.length} records as JSON.`);
  });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Wire up ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateStats();

  // Refresh stats every 2 seconds while popup is open
  const interval = setInterval(updateStats, 2000);
  window.addEventListener('unload', () => clearInterval(interval));

  // Hashtag quick buttons
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => openHashtag(btn.dataset.tag));
  });

  // Custom tag / username input
  document.getElementById('goBtn')?.addEventListener('click', () => {
    const val = document.getElementById('customTag')?.value?.trim();
    if (val) openHashtag(val);
    else showStatus('Enter a hashtag or @username first.');
  });
  document.getElementById('customTag')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('goBtn')?.click();
  });

  // Open feed
  document.getElementById('openFeedBtn')?.addEventListener('click', () => {
    chrome.tabs.query({ url: '*://www.instagram.com/*' }, tabs => {
      if (tabs.length > 0) chrome.tabs.update(tabs[0].id, { url: 'https://www.instagram.com/', active: true });
      else chrome.tabs.create({ url: 'https://www.instagram.com/' });
    });
  });

  document.getElementById('downloadBtn')?.addEventListener('click', downloadCSV);
  document.getElementById('downloadJsonBtn')?.addEventListener('click', downloadJSON);

  document.getElementById('clearBtn')?.addEventListener('click', () => {
    if (!confirm('Delete ALL scraped Instagram data?')) return;
    chrome.storage.local.remove(STORAGE_KEY, () => {
      updateStats();
      showStatus('Data cleared.');
    });
  });

  // Listen for real-time count updates from content script
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.action === 'count_update') updateStats();
  });
});
