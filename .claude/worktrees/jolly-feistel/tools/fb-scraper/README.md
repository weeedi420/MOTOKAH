# Facebook Group Car Scraper

Scrapes car listings from East African Facebook groups using the **Apify API** — no Facebook account needed, zero ban risk.

## How it works

1. You provide Facebook group URLs
2. The tool calls Apify's Facebook Groups Scraper actor
3. Posts are filtered for car-related content
4. Output is saved as JSON ready to paste into `mockData.ts`

## Setup

1. Create a free account at https://apify.com
2. Get your API token from https://console.apify.com/settings/integrations
3. Add it to the `.env` file:
   ```
   APIFY_TOKEN=your_token_here
   ```

## Usage

```bash
cd tools/fb-scraper
npm install
node scrape.js
```

Output: `output/scraped-cars.json`

## Target Groups (East Africa)

- Buy & Sell Cars Tanzania: https://www.facebook.com/groups/carstz
- Vehicles for Sale Kenya: https://www.facebook.com/groups/vehicleskenya
- Uganda Cars for Sale: https://www.facebook.com/groups/ugandacars
- Dar es Salaam Cars: https://www.facebook.com/groups/darcars

## Free tier limits

Apify free tier gives $5/month in credits. Each Facebook group scrape costs ~$0.10–0.30 depending on post count. You can scrape ~20–50 groups per month for free.
