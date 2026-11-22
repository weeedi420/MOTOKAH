import { chromium } from "playwright";

// Every page must end up with exactly one description, one title, and (apart from the home page)
// a description of its own rather than the home page's.
const BASE = process.argv[2] || "http://localhost:4173";
const PATHS = ["/", "/duty-calculator", "/kenya/duty-calculator", "/search", "/dealers", "/tanzania/new-cars", "/brands/toyota",
  "/brands/toyota/land-cruiser-prado", "/city/dar-es-salaam", "/country/tanzania", "/cars/toyota/in/dar-es-salaam", "/blog", "/about", "/faq"];
const b = await chromium.launch({ executablePath: "C:/Users/rapid/AppData/Local/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-win64/chrome-headless-shell.exe" });
const ctx = await b.newContext();
await ctx.route(/clarity\.ms|google-analytics|googletagmanager|facebook/, (r) => r.abort());
let homeDesc = null;
let fails = 0;
for (const path of PATHS) {
  const p = await ctx.newPage();
  await p.goto(`${BASE}${path}`, { waitUntil: "load" });
  await p.waitForTimeout(2500);
  const m = await p.evaluate(() => ({
    title: document.title,
    descs: [...document.querySelectorAll("meta[name=description]")].map((e) => e.getAttribute("content")),
    canon: [...document.querySelectorAll("link[rel=canonical]")].length,
  }));
  if (path === "/") homeDesc = m.descs[0];
  const own = path === "/" || m.descs[0] !== homeDesc;
  const ok = m.descs.length === 1 && own && m.canon <= 1;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${path} descs=${m.descs.length}${own ? "" : " (home page's description)"} canonical=${m.canon} | ${m.title}`);
  await p.close();
}
await b.close();
process.exit(fails ? 1 : 0);
