import { chromium } from "playwright";

// Uses the calculator like a person on a phone: pick year, type engine size and CIF, calculate.
// Checks the total, the Google-facing tags, and that Kenya still works.
const BASE = process.argv[2] || "http://localhost:4173";
const b = await chromium.launch({ executablePath: "C:/Users/rapid/AppData/Local/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-win64/chrome-headless-shell.exe" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.route(/clarity\.ms|google-analytics|googletagmanager|facebook/, (r) => r.abort());
let fails = 0;
const check = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"} ${msg}`); };

const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.goto(`${BASE}/duty-calculator`, { waitUntil: "load" });
await p.waitForTimeout(2500);
const year = new Date().getFullYear() - 10;
await p.selectOption("label:has-text('Year of manufacture') select", String(year));
await p.fill("input[placeholder='e.g. 1300']", "1300");
await p.fill("input[placeholder='e.g. 5500']", "5000");
await p.screenshot({ path: "D:/MOTOKAH/reports/native-check/duty-1-filled.png" });
await p.click("button:has-text('Calculate')");
await p.waitForTimeout(500);
const total = await p.$eval("p.text-2xl", (e) => e.textContent);
// Hand-worked: 2687.5 + 1383.75 + 100 + 30 + 115.38 = 4316.63 USD = TZS 11,223,250
check(total === "TZS 11,223,250", `10-year-old 1300cc, CIF $5,000 -> ${total} (expected TZS 11,223,250)`);
const rows = await p.$$eval(".divide-y > div p.text-sm.font-medium", (els) => els.map((e) => e.textContent));
check(rows.includes("Excise Duty, vehicle age (18%)") && rows.includes("Railway Development Levy (2%)"), `rows: ${rows.join(" | ")}`);
await p.screenshot({ path: "D:/MOTOKAH/reports/native-check/duty-2-result.png", fullPage: true });

const meta = await p.evaluate(() => ({
  title: document.title,
  desc: document.querySelector("meta[name=description]")?.getAttribute("content"),
  canonical: document.querySelector("link[rel=canonical]")?.getAttribute("href"),
  ld: [...document.querySelectorAll("script[type='application/ld+json']")].map((s) => s.textContent).join(""),
}));
check(meta.title === "TRA Car Import Duty Calculator Tanzania (2026 Rates) | Motokah", `title: ${meta.title}`);
check(meta.desc?.startsWith("Free TRA vehicle tax calculator"), `description: ${meta.desc?.slice(0, 60)}...`);
check(meta.canonical === "https://www.motokah.com/duty-calculator", `canonical: ${meta.canonical}`);
check(meta.ld.includes("FAQPage") && meta.ld.includes("How much extra do older cars pay?"), "FAQ structured data present");
check(!/[\u2013\u2014]/.test(meta.title + meta.desc), "no long dashes in title/description");

await p.goto(`${BASE}/kenya/duty-calculator`, { waitUntil: "load" });
await p.waitForTimeout(2000);
await p.fill("input[placeholder='e.g. 1300']", "1500");
await p.fill("input[placeholder='e.g. 5500']", "8000");
await p.click("button:has-text('Calculate')");
await p.waitForTimeout(500);
const ke = await p.$eval("p.text-2xl", (e) => e.textContent);
check(/^KES /.test(ke || ""), `Kenya still calculates: ${ke}`);
await p.screenshot({ path: "D:/MOTOKAH/reports/native-check/duty-3-kenya.png" });
check(errs.length === 0, `page errors: ${JSON.stringify(errs)}`);
await b.close();
process.exit(fails ? 1 : 0);
