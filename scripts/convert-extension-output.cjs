#!/usr/bin/env node
/**
 * Converts Chrome extension JSON export → src/data/showrooms/{username}.json
 *
 * Usage:
 *   node scripts/convert-extension-output.cjs <path-to-export.json>
 *   node scripts/convert-extension-output.cjs <path-to-export.json> --dry-run
 *
 * The extension exports an array of rows. This script:
 *   1. Groups rows by username
 *   2. Deduplicates by post_url / shortcode
 *   3. Filters posts with no images
 *   4. Filters out reels (/reel/ in URL)
 *   5. Merges into existing showroom JSON (preserves old posts)
 *   6. Writes to src/data/showrooms/{username}.json
 *
 * Images stay as direct Instagram CDN URLs — no download needed.
 */

const fs   = require('fs');
const path = require('path');

const SHOWROOMS_DIR = path.join(__dirname, '..', 'src', 'data', 'showrooms');
const isDryRun = process.argv.includes('--dry-run');

const inputFile = process.argv.find(a => a.endsWith('.json') && !a.includes('showrooms'));
if (!inputFile) {
  console.error('Usage: node scripts/convert-extension-output.cjs <export.json> [--dry-run]');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
// Support both flat array and { data: [...] } wrapper
const rows = Array.isArray(raw) ? raw : (raw.data || raw.listings || []);

console.log(`\nLoaded ${rows.length} rows from ${path.basename(inputFile)}\n`);

// Group by username
const byUser = {};
for (const row of rows) {
  const username = (row.username || '').replace(/^@/, '').trim();
  if (!username) continue;
  // Skip reels
  if (row.post_url && row.post_url.includes('/reel/')) continue;
  // Skip rows with no images
  const images = row.images || (row.images_all ? row.images_all.split(' | ').filter(Boolean) : []);
  if (!images.length && !row.image_1) continue;

  if (!byUser[username]) byUser[username] = [];
  byUser[username].push(row);
}

const usernames = Object.keys(byUser);
console.log(`Found ${usernames.length} unique usernames: ${usernames.join(', ')}\n`);

let created = 0;
let updated = 0;

for (const username of usernames) {
  const outPath = path.join(SHOWROOMS_DIR, `${username}.json`);

  // Load existing JSON if present
  let existing = { username, full_name: '', phone: '', posts: [] };
  if (fs.existsSync(outPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    } catch {}
  }

  const existingUrls = new Set((existing.posts || []).map(p => p.url || p.shortcode));
  const newPosts = [];

  for (const row of byUser[username]) {
    const postUrl = row.post_url || '';
    const shortcode = row.shortcode || postUrl.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/)?.[1] || '';

    // Dedup
    if (shortcode && existingUrls.has(shortcode)) continue;
    if (postUrl && existingUrls.has(postUrl)) continue;

    // Build images array
    let images = row.images || [];
    if (!images.length && row.images_all) images = row.images_all.split(' | ').filter(Boolean);
    if (!images.length && row.image_1) images = [row.image_1, row.image_2, row.image_3].filter(Boolean);

    // Try to extract phone from row
    if (row.phones && !existing.phone) {
      existing.phone = row.phones.split(' | ')[0] || '';
    }

    newPosts.push({
      shortcode,
      date: row.scraped_at || new Date().toISOString(),
      caption: (row.caption || '').slice(0, 800),
      likes: 0,
      images,
      url: postUrl,
    });

    existingUrls.add(shortcode || postUrl);
  }

  if (!newPosts.length) {
    console.log(`  ${username}: no new posts (${(existing.posts || []).length} existing)`);
    continue;
  }

  const merged = {
    ...existing,
    username,
    scraped_at: new Date().toISOString(),
    posts: [...(existing.posts || []), ...newPosts],
  };

  const isNew = !fs.existsSync(outPath);

  if (!isDryRun) {
    fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8');
  }

  const action = isNew ? 'CREATED' : 'UPDATED';
  console.log(`  ${action}: ${username}.json — added ${newPosts.length} posts (total: ${merged.posts.length})`);

  if (isNew) created++;
  else updated++;
}

console.log(`\n${isDryRun ? '[DRY RUN] Would have written:' : 'Done!'}`);
console.log(`  ${created} new showroom files`);
console.log(`  ${updated} existing files updated`);
if (isDryRun) console.log('\nRemove --dry-run to actually write files.');
else console.log('\nRestart dev server to see new showrooms.');
