// ── Popup: URL Queue Manager ─────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const startBtn = document.getElementById('startBtn');
  const defaultBtn = document.getElementById('defaultBtn');
  const sleepBtn = document.getElementById('sleepBtn');
  const urlSection = document.getElementById('urlSection');
  const progressSection = document.getElementById('progressSection');
  const scrapedCount = document.getElementById('scrapedCount');
  const urlCount = document.getElementById('urlCount');
  const progressFill = document.getElementById('progressFill');
  const statusText = document.getElementById('statusText');
  const urlList = document.getElementById('urlList');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');

  let urls = [];
  let currentIndex = 0;
  let totalScraped = 0;

  const DEFAULT_URLS = [
    'https://jiji.ug/cars',
    'https://jiji.ng/vehicles',
    'https://jiji.rw/cars',
    'https://jiji.bi/cars',
    'https://jiji.com.et/cars'
  ];

  chrome.storage.local.get(['motokah_queue', 'motokah_current', 'motokah_listings', 'motokah_auto_run'], (result) => {
    if (result.motokah_queue && result.motokah_queue.length > 0) {
      urls = result.motokah_queue;
      currentIndex = result.motokah_current || 0;
      totalScraped = (result.motokah_listings || []).length;
      showProgress();
      updateUI();
    }
  });

  function showProgress() {
    urlSection.style.display = 'none';
    progressSection.style.display = 'block';
  }

  function updateUI() {
    scrapedCount.textContent = totalScraped;
    urlCount.textContent = `${Math.min(currentIndex, urls.length)}/${urls.length}`;
    const pct = urls.length > 0 ? (currentIndex / urls.length) * 100 : 0;
    progressFill.style.width = `${pct}%`;

    if (currentIndex >= urls.length) {
      statusText.textContent = 'All done! Download your CSV.';
      statusText.classList.add('active');
    } else {
      statusText.textContent = `Next: URL #${currentIndex + 1} of ${urls.length}`;
    }

    urlList.innerHTML = urls.map((url, i) => {
      const cls = i < currentIndex ? 'done' : (i === currentIndex ? 'current' : '');
      const dotCls = i < currentIndex ? 'done' : (i === currentIndex ? 'current' : '');
      return `<div class="url-item ${cls}"><div class="url-dot ${dotCls}"></div><div class="url-text">${url.replace(/^https?:\/\//, '')}</div></div>`;
    }).join('');
  }

  function startQueue(queue, autoRun) {
    urls = queue;
    currentIndex = 0;
    const data = {
      motokah_queue: urls,
      motokah_current: 0,
      motokah_auto_run: !!autoRun
      // NOTE: we do NOT wipe motokah_listings so previous country data is preserved
    };
    chrome.storage.local.set(data, () => {
      showProgress();
      updateUI();
      chrome.tabs.create({ url: urls[0], active: !autoRun });
      if (autoRun) {
        statusText.textContent = `😴 Sleep mode ON. Auto-scraping ${urls.length} URLs...`;
      } else {
        statusText.textContent = `Opened URL #1 of ${urls.length}. Click 🚀 Auto Scrape on the page.`;
      }
    });
  }

  startBtn.addEventListener('click', () => {
    const raw = urlInput.value.trim();
    if (!raw) {
      alert('Paste at least one URL or click Use Default URLs');
      return;
    }
    const queue = raw.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    startQueue(queue, false);
  });

  defaultBtn.addEventListener('click', () => {
    startQueue(DEFAULT_URLS, false);
  });

  sleepBtn.addEventListener('click', () => {
    startQueue(DEFAULT_URLS, true);
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.motokah_current) {
      currentIndex = changes.motokah_current.newValue;
    }
    if (changes.motokah_listings) {
      totalScraped = (changes.motokah_listings.newValue || []).length;
    }
    updateUI();
  });

  downloadBtn.addEventListener('click', () => {
    chrome.storage.local.get(['motokah_listings'], (result) => {
      const listings = result.motokah_listings || [];
      if (listings.length === 0) {
        alert('No listings scraped yet');
        return;
      }

      const headers = Object.keys(listings[0]);
      const csv = [
        headers.join(','),
        ...listings.map(row => headers.map(h => {
          let val = row[h];
          if (val == null) val = '';
          val = String(val);
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return '"' + val.replace(/"/g, '""') + '"';
          }
          return val;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `motokah_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      statusText.textContent = `Downloaded ${listings.length} cars!`;
      statusText.classList.add('active');
    });
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('Delete all scraped data and reset queue?')) return;
    chrome.storage.local.remove(['motokah_queue', 'motokah_current', 'motokah_listings', 'motokah_auto_run'], () => {
      location.reload();
    });
  });
});
