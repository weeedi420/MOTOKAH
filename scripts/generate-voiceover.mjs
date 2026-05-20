/**
 * Generate Motokah promo voiceover via ElevenLabs with word-level timestamps.
 * Usage: ELEVEN_KEY=sk_xxx node scripts/generate-voiceover.mjs
 *
 * Saves: public/audio/voiceover.mp3 + src/remotion/timing.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUT_AUDIO  = path.join(__dirname, "../public/audio/voiceover.mp3");
const OUT_TIMING = path.join(__dirname, "../src/remotion/timing.ts");

const API_KEY = process.env.ELEVEN_KEY;
// Free pre-made voices (no paid plan needed)
const VOICES  = [
  "N2lVS1w4EtoT3dr4eOWO", // Callum — confirmed working
  "21m00Tcm4TlvDq8ikWAM", // Rachel
  "pNInz6obpgDQGcFmaJgB", // Adam
];
const FPS     = 30;

const TEXT = `Yo! Buying a car in East Africa used to be a headache. Endless WhatsApp groups, random listings, and sketchy prices? Not anymore! Motokah changes everything! Post your car in just two minutes — completely free! Buyers across Tanzania, Kenya, Uganda, Rwanda, and Burundi find you directly! No middlemen. No commission. Just your car, your price, your deal! Over ten thousand verified listings across five countries on one massive platform! Motokah dot com! Let's go!`;

if (!API_KEY) {
  console.error("Set ELEVEN_KEY:\n  ELEVEN_KEY=sk_xxx node scripts/generate-voiceover.mjs");
  process.exit(1);
}

fs.mkdirSync(path.join(__dirname, "../public/audio"), { recursive: true });

// ── helpers ──────────────────────────────────────────────────────────────────

function extractWords(alignment) {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;
  const words = [];
  let cur = "", wordStart = 0;

  for (let i = 0; i <= characters.length; i++) {
    const ch = characters[i];
    const sep = !ch || ch === " " || ch === "\n" || ch === "—" || ch === "–";
    if (sep) {
      if (cur.trim()) {
        words.push({
          word: cur.toLowerCase().replace(/[^a-z0-9]/g, ""),
          raw:  cur.trim(),
          start: wordStart,
          end:   character_end_times_seconds[i - 1] ?? character_end_times_seconds.at(-1),
          frame: Math.round(wordStart * FPS),
        });
      }
      cur = "";
    } else {
      if (!cur) wordStart = character_start_times_seconds[i];
      cur += ch;
    }
  }
  return words;
}

function findWord(words, target, nth = 1) {
  let n = 0;
  const t = target.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const w of words) {
    if (w.word === t && ++n === nth) return w;
  }
  return null;
}

function findPhrase(words, ...targets) {
  const ts = targets.map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (let i = 0; i < words.length; i++) {
    if (ts.every((t, j) => words[i + j]?.word === t)) return words[i];
  }
  return null;
}

// ── generate ─────────────────────────────────────────────────────────────────

async function tryGenerate(voiceId) {
  console.log(`Trying voice ${voiceId}...`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: TEXT,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.42, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

let data = null, usedVoice = null;
for (const vid of VOICES) {
  try { data = await tryGenerate(vid); usedVoice = vid; console.log(`✓ ${vid}`); break; }
  catch (e) { console.error(`✗ ${vid}: ${e.message}`); }
}
if (!data) { console.error("All voices failed."); process.exit(1); }

// ── save audio ────────────────────────────────────────────────────────────────

const audioBuf = Buffer.from(data.audio_base64, "base64");
fs.writeFileSync(OUT_AUDIO, audioBuf);
console.log(`\nAudio: ${OUT_AUDIO} (${(audioBuf.byteLength / 1024).toFixed(0)} KB)`);

// ── timestamps ────────────────────────────────────────────────────────────────

const words  = extractWords(data.alignment);
const durSec = data.alignment.character_end_times_seconds.at(-1);
const durF   = Math.ceil(durSec * FPS);

console.log(`\nDuration: ${durSec.toFixed(2)}s = ${durF} frames`);
console.log("\n── WORD TIMESTAMPS ─────────────────────────────");
words.forEach(w => console.log(`  ${String(w.frame).padStart(4)}f  ${w.start.toFixed(3)}s  "${w.raw}"`));

// ── key phrase frames ─────────────────────────────────────────────────────────

const buying     = findWord(words, "buying");
const motokah1   = findWord(words, "motokah", 1);
const post       = findPhrase(words, "post", "your");
const buyers     = findWord(words, "buyers");
const tanzania   = findWord(words, "tanzania");
const kenya      = findWord(words, "kenya");
const uganda     = findWord(words, "uganda");
const rwanda     = findWord(words, "rwanda");
const burundi    = findWord(words, "burundi");
const noMiddle   = findPhrase(words, "no", "middlemen");
const five       = findPhrase(words, "five", "countries");
const motokah2   = findWord(words, "motokah", 2);

const f = (w, off = 0) => (w?.frame ?? 0) + off;

const T = {
  s1:  0,
  s2:  f(motokah1, -10),
  s3:  f(motokah1),
  s4:  f(post),
  s5:  f(buyers),
  s6:  f(noMiddle),
  s7:  f(tanzania, -6),
  s8:  f(five, -6),
  s9:  f(motokah2, -8),
  end: durF + 20,
};

const COUNTRY_FRAMES = {
  tz: f(tanzania),
  ke: f(kenya),
  ug: f(uganda),
  rw: f(rwanda),
  bi: f(burundi),
};

console.log("\n── SCENE TIMING ─────────────────────────────────");
Object.entries(T).forEach(([k, v]) => console.log(`  T.${k.padEnd(4)} = ${String(v).padStart(4)}f  (${(v/FPS).toFixed(1)}s)`));
console.log("\n── COUNTRY FRAMES ───────────────────────────────");
Object.entries(COUNTRY_FRAMES).forEach(([k, v]) => console.log(`  ${k} = ${v}f  (${(v/FPS).toFixed(1)}s)`));

// ── write timing.ts ──────────────────────────────────────────────────────────

const src = `// Auto-generated — do not edit by hand
// Regenerate: ELEVEN_KEY=sk_xxx node scripts/generate-voiceover.mjs
// Voice: ${usedVoice}  |  Duration: ${durSec.toFixed(2)}s = ${durF} frames @ ${FPS}fps

export const FPS = ${FPS};

// Scene start frames — derived from voiceover word timestamps
export const T = {
  s1:  ${T.s1},   // "Yo! Buying a car..."
  s2:  ${T.s2},   // approach "Motokah changes everything"
  s3:  ${T.s3},   // "Motokah changes everything!"
  s4:  ${T.s4},   // "Post your car..."
  s5:  ${T.s5},   // "Buyers across..."
  s6:  ${T.s6},   // "No middlemen..."
  s7:  ${T.s7},   // "Tanzania, Kenya..."
  s8:  ${T.s8},   // "Five countries..."
  s9:  ${T.s9},   // "Motokah dot com!"
  end: ${T.end},
};

// Word-level frames for Scene07 country stagger
export const COUNTRY_FRAMES = {
  tz: ${COUNTRY_FRAMES.tz},
  ke: ${COUNTRY_FRAMES.ke},
  ug: ${COUNTRY_FRAMES.ug},
  rw: ${COUNTRY_FRAMES.rw},
  bi: ${COUNTRY_FRAMES.bi},
};
`;

fs.writeFileSync(OUT_TIMING, src);
console.log(`\nWrote: ${OUT_TIMING}`);
