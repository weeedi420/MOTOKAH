import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

async function captureVideo() {
  // Try to find Chrome/Edge
  const possiblePaths = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ];

  const browserPath = possiblePaths.find((p) => fs.existsSync(p));
  
  if (!browserPath) {
    console.error("No Chrome or Edge found!");
    process.exit(1);
  }

  console.log(`Using browser: ${browserPath}`);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const outDir = "D:/remix-of-afriwheels-hub-main 2/remix-of-afriwheels-hub-main/screenshots";
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log("Navigating to promo page...");
  await page.goto("http://localhost:8080/promo", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));

  // Click Premium Motion Ad button
  console.log("Switching to Premium Motion Ad...");
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.evaluate((el) => el.textContent);
    if (text?.includes('Premium Motion')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1500));

  // Take screenshots at different timestamps
  const timestamps = [0, 1, 2, 3, 4, 5, 6];
  
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    
    // Seek video to timestamp
    await page.evaluate((time) => {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = time;
        video.pause();
      }
    }, ts);
    
    await new Promise((r) => setTimeout(r, 500));
    
    const filename = `frame-${String(i + 1).padStart(2, "0")}-${ts.toFixed(1)}s.png`;
    await page.screenshot({ path: path.join(outDir, filename) });
    console.log(`Screenshot: ${filename}`);
  }

  // Full page screenshot
  await page.screenshot({ path: path.join(outDir, "full-page.png"), fullPage: true });
  console.log("Screenshot: full-page.png");

  await browser.close();
  console.log("\nAll screenshots captured! Check the screenshots/ folder.");
}

captureVideo().catch((err) => {
  console.error(err);
  process.exit(1);
});
