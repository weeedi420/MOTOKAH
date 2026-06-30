const { chromium } = require("playwright-core");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:8080";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXE ||
  "C:/Users/rapid/AppData/Local/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-win64/chrome-headless-shell.exe";

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => localStorage.setItem("motokah_welcome_completed", "true"));

  const checks = [];
  for (const route of [
    "/search?bodyType=Boat",
    "/listing/boat-nicolette-island-spirit-38-40",
    "/dealer/mock-dealer-nicolette-boats",
  ]) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(750);
    const text = await page.locator("body").innerText();
    checks.push({
      route,
      ok: !/Something went wrong|Cannot read properties|TypeError|Contact for price/i.test(text),
      hasBoatCopy: /Nicolette|Island Spirit|Boat|Catamaran/i.test(text),
    });
  }

  await browser.close();
  console.log(JSON.stringify(checks, null, 2));
  if (checks.some((check) => !check.ok || !check.hasBoatCopy)) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
