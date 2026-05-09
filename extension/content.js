/**
 * Motokah Page Scraper — Simple Jiji scraper
 * Run on any Jiji search results page
 */

(function() {
  'use strict';

  function scrapePage() {
    const cards = document.querySelectorAll('[data-testid="listing-card"], .b-listing-card, [class*="listing-card"], .qa-lazyload-item');
    const listings = [];

    cards.forEach(card => {
      // Title
      const titleEl = card.querySelector('h3, h2, [class*="title"], [data-testid="listing-title"]');
      const title = titleEl?.innerText?.trim() || '';

      // Price
      const priceEl = card.querySelector('[class*="price"], [data-testid="listing-price"]');
      const priceText = priceEl?.innerText?.trim() || '';
      const price = priceText.replace(/[^0-9]/g, '');

      // Location
      const locEl = card.querySelector('[class*="location"], [data-testid="listing-location"]');
      const location = locEl?.innerText?.trim() || 'Dar es Salaam';

      // Image
      const imgEl = card.querySelector('img');
      const imageUrl = imgEl?.src || imgEl?.dataset?.src || '';

      // URL
      const linkEl = card.querySelector('a');
      const url = linkEl?.href || '';

      // Extract make, model, year from title
      const yearMatch = title.match(/\b(19|20)\d{2}\b/);
      const year = yearMatch ? yearMatch[0] : '';

      const commonMakes = ['Toyota','Honda','Nissan','Mazda','Subaru','Mitsubishi','Suzuki','Hyundai','Kia','Volkswagen','Mercedes','BMW','Audi','Ford','Isuzu','Land Rover','Lexus','Jeep','Chevrolet','Daihatsu','Peugeot','Renault','Volvo','Changan','Chery','Proton','Tata','Mahindra','Great Wall','Haval','BYD','Tesla','MG','Geely','Datsun','FAW','Foton','JMC','Sinotruk'];
      const make = commonMakes.find(m => title.toLowerCase().includes(m.toLowerCase())) || '';

      const model = title
        .replace(new RegExp(make, 'i'), '')
        .replace(year, '')
        .replace(/\b(Used|New|Certified|Pre-owned)\b/gi, '')
        .replace(/\b(White|Black|Silver|Gray|Grey|Red|Blue|Green|Gold|Beige|Brown|Yellow|Orange|Purple|Maroon)\b/gi, '')
        .trim();

      if (title && price) {
        listings.push({
          title,
          make,
          model,
          year,
          price,
          currency: priceText.includes('KSh') ? 'KES' : 'TZS',
          priceText,
          location,
          country: window.location.hostname.includes('co.ke') ? 'KE' : 'TZ',
          imageUrl,
          url,
          site: window.location.hostname.includes('co.ke') ? 'jiji_ke' : 'jiji_tz',
          scrapedAt: new Date().toISOString()
        });
      }
    });

    return listings;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrape') {
      const listings = scrapePage();
      // Save to storage
      chrome.storage.local.get(['motokah_listings'], (result) => {
        const existing = result.motokah_listings || [];
        const combined = [...existing, ...listings];
        chrome.storage.local.set({ motokah_listings: combined }, () => {
          sendResponse({ count: listings.length, total: combined.length });
        });
      });
      return true; // async
    }

    if (request.action === 'getCount') {
      chrome.storage.local.get(['motokah_listings'], (result) => {
        const listings = result.motokah_listings || [];
        sendResponse({ total: listings.length });
      });
      return true;
    }

    if (request.action === 'download') {
      chrome.storage.local.get(['motokah_listings'], (result) => {
        const listings = result.motokah_listings || [];
        if (listings.length === 0) {
          sendResponse({ error: 'No listings scraped yet' });
          return;
        }

        const headers = Object.keys(listings[0]);
        const csv = [
          headers.join(','),
          ...listings.map(row => headers.map(h => {
            const val = row[h] || '';
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

        sendResponse({ success: true, count: listings.length });
      });
      return true;
    }

    if (request.action === 'clear') {
      chrome.storage.local.set({ motokah_listings: [] }, () => {
        sendResponse({ success: true });
      });
      return true;
    }
  });
})();
