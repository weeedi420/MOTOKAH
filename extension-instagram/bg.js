// ── Background service worker ─────────────────────────────────

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Forward count_update to all extension views (popup)
  if (request.action === 'count_update') {
    // Let popup poll via storage — no-op here, message already broadcast
    sendResponse({ ok: true });
    return false;
  }

  if (request.action === 'get_stats') {
    chrome.storage.local.get(['motokah_ig_listings'], result => {
      const listings = result.motokah_ig_listings || [];
      const withPhone = listings.filter(r => r.phones && r.phones.trim().length > 0).length;
      sendResponse({ total: listings.length, withPhone });
    });
    return true; // async
  }
});
