/**
 * Step 1: Process Turbo Download photos into a structured CSV
 * Groups files by post (same timestamp = same carousel), outputs one row per post.
 *
 * Usage:
 *   node scripts/process-ig-downloads.cjs "D:\cars for motokah"
 *
 * Output: ig-posts.csv  (in current directory)
 */

const fs = require('fs');
const path = require('path');

const INPUT_DIR = process.argv[2] || 'D:\\cars for motokah';
const OUTPUT_CSV = path.join(process.cwd(), 'ig-posts.csv');

// Filename pattern: {username}_{timestamp}_{post_id}_{user_id}.{ext}
const FILE_RE = /^(.+?)_(\d+)_(\d+)_(\d+)\.(jpg|jpeg|webp|heic|png|mp4)$/i;

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'webp', 'heic', 'png']);

function parseFilename(filename) {
  const m = filename.match(FILE_RE);
  if (!m) return null;
  return {
    username: m[1],
    timestamp: parseInt(m[2]),
    post_id: m[3],
    user_id: m[4],
    ext: m[5].toLowerCase(),
    filename
  };
}

function timestampToDate(ts) {
  // Instagram timestamps are in seconds
  const ms = ts < 1e12 ? ts * 1000 : ts;
  return new Date(ms).toISOString().slice(0, 10);
}

function main() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Folder not found: ${INPUT_DIR}`);
    process.exit(1);
  }

  // Map: "username|timestamp" → { meta, images[], videos[] }
  const posts = new Map();

  const accounts = fs.readdirSync(INPUT_DIR).filter(name => {
    return fs.statSync(path.join(INPUT_DIR, name)).isDirectory();
  });

  console.log(`Found ${accounts.length} accounts: ${accounts.join(', ')}\n`);

  let fileCount = 0;
  let skipped = 0;

  for (const account of accounts) {
    const accountDir = path.join(INPUT_DIR, account);
    const files = fs.readdirSync(accountDir);

    for (const file of files) {
      const parsed = parseFilename(file);
      if (!parsed) { skipped++; continue; }

      const key = `${parsed.username}|${parsed.timestamp}`;

      if (!posts.has(key)) {
        posts.set(key, {
          username: parsed.username,
          timestamp: parsed.timestamp,
          post_id: parsed.post_id,
          user_id: parsed.user_id,
          date: timestampToDate(parsed.timestamp),
          images: [],
          videos: []
        });
      }

      const post = posts.get(key);
      const fullPath = path.join(accountDir, file);

      if (IMAGE_EXTS.has(parsed.ext)) {
        post.images.push(fullPath);
      } else if (parsed.ext === 'mp4') {
        post.videos.push(fullPath);
      }

      fileCount++;
    }
  }

  console.log(`Processed ${fileCount} files, ${skipped} skipped`);
  console.log(`Found ${posts.size} unique posts\n`);

  // Write CSV
  const HEADERS = [
    'username', 'post_id', 'user_id', 'date', 'unix_timestamp',
    'image_count', 'video_count',
    'img_1', 'img_2', 'img_3', 'img_4', 'img_5',
    'all_images'
  ];

  const rows = [HEADERS.join(',')];

  const sorted = [...posts.values()].sort((a, b) => {
    if (a.username !== b.username) return a.username.localeCompare(b.username);
    return b.timestamp - a.timestamp; // newest first
  });

  for (const p of sorted) {
    const imgs = p.images;
    const row = [
      p.username,
      p.post_id,
      p.user_id,
      p.date,
      p.timestamp,
      imgs.length,
      p.videos.length,
      imgs[0] ? `"${imgs[0]}"` : '',
      imgs[1] ? `"${imgs[1]}"` : '',
      imgs[2] ? `"${imgs[2]}"` : '',
      imgs[3] ? `"${imgs[3]}"` : '',
      imgs[4] ? `"${imgs[4]}"` : '',
      `"${imgs.join(' | ')}"`
    ];
    rows.push(row.join(','));
  }

  fs.writeFileSync(OUTPUT_CSV, '﻿' + rows.join('\n'), 'utf8');
  console.log(`✅ Saved ${sorted.length} posts → ${OUTPUT_CSV}`);

  // Summary per account
  const byAccount = {};
  for (const p of sorted) {
    if (!byAccount[p.username]) byAccount[p.username] = { posts: 0, images: 0 };
    byAccount[p.username].posts++;
    byAccount[p.username].images += p.images.length;
  }
  console.log('\n=== Summary ===');
  for (const [acc, stats] of Object.entries(byAccount)) {
    console.log(`  ${acc}: ${stats.posts} posts, ${stats.images} images`);
  }
}

main();
