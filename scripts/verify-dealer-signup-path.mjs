import { chromium } from "playwright";
// A logged-out dealer taps the email button: they must land on a working sign-up screen,
// and after sign-up be sent back to the dealer registration form.
const b = await chromium.launch({ executablePath: "C:/Users/rapid/AppData/Local/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-win64/chrome-headless-shell.exe" });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await p.route(/clarity\.ms|google-analytics|googletagmanager|facebook/, (r) => r.abort());
await p.goto("https://www.motokah.com/become-dealer?utm_source=email&utm_medium=outreach", { waitUntil: "load" });
await p.waitForTimeout(5000);
console.log("landed on:", p.url());
const text = (await p.textContent("body")).replace(/\s+/g, " ");
console.log("has sign up option:", /sign up|create (an )?account|register/i.test(text));
console.log("inputs:", await p.$$eval("input", (els) => els.map((e) => e.type + ":" + (e.placeholder || e.name || ""))));
await p.screenshot({ path: "reports/native-check/dealer-path-1.png" });
const signUp = await p.$("text=/sign up/i");
if (signUp) { await signUp.click(); await p.waitForTimeout(1500); await p.screenshot({ path: "reports/native-check/dealer-path-2-signup.png" }); console.log("signup inputs:", await p.$$eval("input", (els) => els.map((e) => e.type + ":" + (e.placeholder || e.name || "")))); }
await b.close();
