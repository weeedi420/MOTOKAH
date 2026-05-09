document.addEventListener('DOMContentLoaded', () => {
  const scrapeBtn = document.getElementById('scrapeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const countEl = document.getElementById('count');
  const statusEl = document.getElementById('status');

  // Check current total
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const isJiji = tab.url && (tab.url.includes('jiji.co.tz') || tab.url.includes('jiji.co.ke'));

    if (!isJiji) {
      statusEl.textContent = 'Not on Jiji. Navigate to jiji.co.tz or jiji.co.ke';
      scrapeBtn.disabled = true;
    } else {
      statusEl.textContent = 'Ready to scrape: ' + tab.url.split('/')[2];
    }

    // Get current count
    chrome.tabs.sendMessage(tab.id, { action: 'getCount' }, (response) => {
      if (response) {
        countEl.textContent = response.total;
        if (response.total > 0) downloadBtn.disabled = false;
      }
    });
  });

  // Scrape button
  scrapeBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      statusEl.textContent = 'Scraping...';
      scrapeBtn.disabled = true;

      chrome.tabs.sendMessage(tab.id, { action: 'scrape' }, (response) => {
        scrapeBtn.disabled = false;
        if (response) {
          countEl.textContent = response.total;
          statusEl.textContent = `Scraped ${response.count} cars (total: ${response.total})`;
          if (response.total > 0) downloadBtn.disabled = false;
        } else {
          statusEl.textContent = 'Error scraping. Refresh page and try again.';
        }
      });
    });
  });

  // Download button
  downloadBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      statusEl.textContent = 'Downloading...';

      chrome.tabs.sendMessage(tab.id, { action: 'download' }, (response) => {
        if (response?.success) {
          statusEl.textContent = `Downloaded ${response.count} cars`;
        } else {
          statusEl.textContent = response?.error || 'Download failed';
        }
      });
    });
  });
});
