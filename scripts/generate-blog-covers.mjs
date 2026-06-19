/**
 * Generates 1200×630 blog cover images and uploads them to Supabase Storage.
 * Updates blog_posts.cover_image with the public URL.
 *
 * Usage: node scripts/generate-blog-covers.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../content/blog-covers");
fs.mkdirSync(OUT_DIR, { recursive: true });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const posts = [
  {
    slug: "how-to-import-a-car-to-kenya-2026",
    title: "How to Import a Car\nto Kenya in 2026",
    tag: "Kenya Import Guide",
    accent: "#FFD700",
    bgImage: null,
    icon: "🚢",
  },
  {
    slug: "best-used-cars-under-2-million-nairobi-2026",
    title: "Best Used Cars\nUnder KES 2 Million\nin Nairobi",
    tag: "Nairobi Buyer's Guide",
    accent: "#00CC66",
    bgImage: null,
    icon: "🚗",
  },
  {
    slug: "bei-ya-magari-mitumba-tanzania-2026",
    title: "Bei ya Magari\nMitumba Tanzania\n2026",
    tag: "Tanzania • Swahili Guide",
    accent: "#FF6600",
    bgImage: null,
    icon: "🇹🇿",
  },
];

function buildHtml(post) {
  const lines = post.title.split("\n");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    font-family: 'Arial Black', 'Arial Bold', sans-serif;
    background: #0A1628;
    overflow: hidden;
    position: relative;
  }

  /* Diagonal accent stripe */
  .stripe {
    position: absolute;
    top: 0; right: 0;
    width: 480px;
    height: 100%;
    background: ${post.accent}18;
    clip-path: polygon(18% 0, 100% 0, 100% 100%, 0% 100%);
  }

  /* Bottom blue bar */
  .bar {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 8px;
    background: #0066CC;
  }

  /* Blue left accent line */
  .left-line {
    position: absolute;
    left: 60px; top: 60px; bottom: 60px;
    width: 5px;
    background: ${post.accent};
    border-radius: 3px;
  }

  /* Dots pattern */
  .dots {
    position: absolute;
    right: 40px;
    top: 40px;
    width: 200px;
    height: 200px;
    opacity: 0.07;
    background-image: radial-gradient(${post.accent} 2px, transparent 2px);
    background-size: 24px 24px;
  }

  .content {
    position: absolute;
    left: 92px;
    top: 0; bottom: 0;
    right: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0;
  }

  .tag {
    font-size: 18px;
    font-weight: 700;
    color: ${post.accent};
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 22px;
    font-family: Arial, sans-serif;
  }

  .title-line {
    font-size: 64px;
    font-weight: 900;
    color: #FFFFFF;
    line-height: 1.08;
    letter-spacing: -1px;
    font-family: 'Arial Black', sans-serif;
  }

  .brand {
    position: absolute;
    bottom: 36px;
    right: 50px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-logo {
    width: 44px;
    height: 44px;
    background: #0066CC;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 900;
    color: white;
    font-family: 'Arial Black', sans-serif;
  }

  .brand-text {
    font-size: 22px;
    font-weight: 900;
    color: #FFFFFF;
    font-family: 'Arial Black', sans-serif;
    letter-spacing: 1px;
  }

  .brand-sub {
    font-size: 12px;
    font-weight: 400;
    color: #8899BB;
    font-family: Arial, sans-serif;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .icon {
    position: absolute;
    right: 100px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 130px;
    opacity: 0.18;
    line-height: 1;
  }
</style>
</head>
<body>
  <div class="stripe"></div>
  <div class="dots"></div>
  <div class="left-line"></div>
  <div class="icon">${post.icon}</div>

  <div class="content">
    <div class="tag">${post.tag}</div>
    ${lines.map(l => `<div class="title-line">${l}</div>`).join("\n    ")}
  </div>

  <div class="brand">
    <div>
      <div class="brand-text">Motokah</div>
      <div class="brand-sub">motokah.com</div>
    </div>
    <div class="brand-logo">M</div>
  </div>

  <div class="bar"></div>
</body>
</html>`;
}

async function run() {
  const executablePath = "C:\\Users\\rapid\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1223\\chrome-headless-shell-win64\\chrome-headless-shell.exe";
  const browser = await chromium.launch({ executablePath });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });

  for (const post of posts) {
    console.log(`Generating cover: ${post.slug}`);
    const html = buildHtml(post);
    await page.setContent(html, { waitUntil: "networkidle" });

    const outFile = path.join(OUT_DIR, `${post.slug}.png`);
    await page.screenshot({ path: outFile, type: "png" });
    console.log(`  Saved: ${outFile}`);

    // Upload to Supabase Storage
    const fileBuffer = fs.readFileSync(outFile);
    const storagePath = `blog-covers/${post.slug}.png`;

    const { error: upErr } = await supabase.storage
      .from("ig-posts")
      .upload(storagePath, fileBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (upErr) {
      console.error(`  Upload error: ${upErr.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from("ig-posts")
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;
    console.log(`  Uploaded: ${publicUrl}`);

    // Update blog_posts record
    const { error: dbErr } = await supabase
      .from("blog_posts")
      .update({ cover_image: publicUrl })
      .eq("slug", post.slug);

    if (dbErr) {
      console.error(`  DB update error: ${dbErr.message}`);
    } else {
      console.log(`  DB updated OK`);
    }
  }

  await browser.close();
  console.log("\nDone. All covers generated and uploaded.");
}

run().catch(console.error);
