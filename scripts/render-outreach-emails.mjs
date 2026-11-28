import fs from "fs"; import { chromium } from "playwright";
const vals = { DEALER_NAME: "Car Junction Tanzania", DEALER_COUNTRY: "Tanzania", DEALER_COUNTRY_UPPER: "TANZANIA", UNSUBSCRIBE_LINK: "#", STAT_IMPRESSIONS: "23,123", STAT_CLICKS: "809", STAT_MONTH_CLICKS: "502", STAT_MONTH_LABEL: "November (to 26 Nov)", STAT_PERIOD: "last 90 days, to 26 Nov 2026" };
const b = await chromium.launch({ executablePath: "C:/Users/rapid/AppData/Local/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-win64/chrome-headless-shell.exe" });
const p = await b.newPage({ viewport: { width: 390, height: 800 } });
for (const f of ["dealer-new", "dealer-growth-visual", "dealer-followup"]) {
  let h = fs.readFileSync(`launch/email/${f}.html`, "utf8");
  for (const [k, v] of Object.entries(vals)) h = h.replaceAll(`{{${k}}}`, v);
  console.log(f, "unfilled:", (h.match(/\{\{\w+\}\}/g) || []).length);
  await p.setContent(h, { waitUntil: "networkidle" });
  await p.screenshot({ path: `reports/native-check/email-${f}.png`, fullPage: true });
}
await b.close();
