// Upload optimized dealer images to Supabase Storage (showroom-images bucket)
// and rewrite src/data/showrooms/*.json image paths to the public storage URLs.
// Run AFTER the scrape + optimize steps:  node scripts/upload-showroom-images.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BUCKET = 'showroom-images';
const PUBLIC_IG = path.join(ROOT, 'public', 'instagram-cars');
const SHOWROOMS = path.join(ROOT, 'src', 'data', 'showrooms');

const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')
    .map(l => l.match(/^([A-Z_]+)=["']?(.*?)["']?\s*$/)).filter(Boolean).map(m => [m[1], m[2]])
);
const supa = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const pub = (key) => `${env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}`;

const localRe = /^\/instagram-cars\/([^/]+)\/(.+)$/;
let uploaded = 0, skipped = 0, missing = 0, rewritten = 0;
const CONC = 8;

async function uploadOne(dealer, file) {
  const local = path.join(PUBLIC_IG, dealer, file);
  if (!fs.existsSync(local)) { missing++; return null; }
  const key = `${dealer}/${file}`;
  const { error } = await supa.storage.from(BUCKET).upload(key, fs.readFileSync(local), {
    contentType: 'image/jpeg', upsert: false,
  });
  if (error && !/exists/i.test(error.message)) { console.log('  upload err', key, error.message); return null; }
  if (error) skipped++; else uploaded++;
  return pub(key);
}

for (const jf of fs.readdirSync(SHOWROOMS).filter(f => f.endsWith('.json'))) {
  const jpath = path.join(SHOWROOMS, jf);
  const data = JSON.parse(fs.readFileSync(jpath, 'utf8'));
  let changed = false;

  // Cap images per dealer (quality over quantity). Trim posts/images beyond cap.
  const MAX_PER_DEALER = 24;
  let dealerCount = 0;
  const keptPosts = [];
  for (const post of data.posts || []) {
    post.images = (post.images || []).filter((u) => dealerCount < MAX_PER_DEALER ? (dealerCount++, true) : false);
    if (post.images.length) keptPosts.push(post);
  }
  if (keptPosts.length !== (data.posts || []).length) changed = true;
  data.posts = keptPosts;

  // collect all (dealer,file) to upload
  const tasks = [];
  for (const post of data.posts) {
    for (let i = 0; i < post.images.length; i++) {
      const m = localRe.exec(post.images[i]);
      if (m) tasks.push({ post, i, dealer: m[1], file: m[2] });
    }
  }
  // upload with limited concurrency
  for (let s = 0; s < tasks.length; s += CONC) {
    const batch = tasks.slice(s, s + CONC);
    const urls = await Promise.all(batch.map(t => uploadOne(t.dealer, t.file)));
    batch.forEach((t, k) => { if (urls[k]) { t.post.images[t.i] = urls[k]; changed = true; rewritten++; } });
  }
  if (changed) { fs.writeFileSync(jpath, JSON.stringify(data, null, 2)); console.log(`  rewrote ${jf}`); }
}

console.log(`\nDone. uploaded=${uploaded} skipped(existing)=${skipped} missing=${missing} urls_rewritten=${rewritten}`);
