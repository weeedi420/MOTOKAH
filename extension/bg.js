// ── Background: Save listings, open next URL, close old tab, manage auto-run ──

let activeScraperTabId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'next_url') {
    const oldTabId = activeScraperTabId;

    chrome.storage.local.get(['motokah_queue', 'motokah_current'], (result) => {
      const queue = result.motokah_queue || [];
      let current = (result.motokah_current || 0) + 1;

      chrome.storage.local.set({ motokah_current: current }, () => {
        // Close the previous tab so they don't pile up
        if (oldTabId && oldTabId !== chrome.tabs.TAB_ID_NONE) {
          chrome.tabs.remove(oldTabId).catch(() => {});
        }

        if (current < queue.length) {
          chrome.tabs.create({ url: queue[current], active: false }, (tab) => {
            if (tab && tab.id) {
              activeScraperTabId = tab.id;
            }
            sendResponse({ next: queue[current], index: current, total: queue.length });
          });
        } else {
          activeScraperTabId = null;
          sendResponse({ done: true, total: queue.length });
        }
      });
    });
    return true; // async
  }

  if (request.action === 'save_listings') {
    chrome.storage.local.get(['motokah_listings'], (result) => {
      const existing = result.motokah_listings || [];
      const combined = [...existing, ...request.listings];
      chrome.storage.local.set({ motokah_listings: combined }, () => {
        sendResponse({ saved: request.listings.length, total: combined.length });
      });
    });
    return true;
  }

  if (request.action === 'register_tab') {
    activeScraperTabId = sender.tab?.id || null;
    sendResponse({ ok: true });
    return true;
  }
});
