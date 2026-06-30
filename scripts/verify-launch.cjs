const { chromium } = require("playwright-core");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:8080";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXE ||
  "C:/Users/rapid/AppData/Local/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-win64/chrome-headless-shell.exe";

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await page.addInitScript(() => {
    localStorage.setItem("motokah_welcome_completed", "true");
  });

  const results = [];
  const routes = ["/", "/search?country=Tanzania", "/city/eldoret", "/showroom/mgayamotors"];

  for (const route of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(750);
    const text = await page.locator("body").innerText({ timeout: 10000 });
    const listingLinks = await page.locator('a[href^="/listing/"]').evaluateAll((nodes) =>
      Array.from(new Set(nodes.map((node) => node.getAttribute("href")).filter(Boolean))).slice(0, 5)
    );
    const badCardText = /Contact for price|Ask Seller|Something went wrong|Cannot read properties|TypeError/i.test(text);
    results.push({ route, listingLinks: listingLinks.length, badCardText });
  }

  const firstListing = await page.locator('a[href^="/listing/"]').first().getAttribute("href").catch(() => null);
  if (firstListing) {
    await page.goto(`${baseUrl}${firstListing}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(750);
    const text = await page.locator("body").innerText({ timeout: 10000 });
    results.push({
      route: firstListing,
      listingDetail: true,
      crashed: /Something went wrong|Cannot read properties|TypeError/i.test(text),
      hasContact: /WhatsApp|Call/i.test(text),
    });
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));

  const failed = results.some((result) => result.badCardText || result.crashed);
  if (failed) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
