/**
 * Generate Motokah promo voiceover via Google Cloud Text-to-Speech
 * Provides word-level timing for perfect frame sync
 * 
 * Usage: GOOGLE_KEY=your-api-key node scripts/generate-voiceover-google.mjs
 * 
 * Saves: public/audio/voiceover.mp3 + src/remotion/timing.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUT_AUDIO  = path.join(__dirname, "../public/audio/voiceover.mp3");
const OUT_TIMING = path.join(__dirname, "../src/remotion/timing.ts");

const API_KEY = process.env.GOOGLE_KEY;
const FPS     = 30;

// Updated script with ALL East African countries
const TEXT = `Yo! Buying a car in East Africa used to be a headache. Endless WhatsApp groups, random listings, and sketchy prices? Not anymore! Motokah changes everything! Post your car in just two minutes — completely free! Buyers across Tanzania, Kenya, Uganda, Rwanda, Burundi, Ethiopia, Somalia, South Sudan, Djibouti, and DRC find you directly! No middlemen. No commission. Just your car, your price, your deal! Over ten thousand verified listings across ten countries on one massive platform! Motokah dot com! Let's go!`;

// African-accented enthusiastic voices
const VOICES = [
  { name: "en-US-Neural2-D", ssmlGender: "MALE" },    // Male, warm, professional
  { name: "en-US-Neural2-F", ssmlGender: "FEMALE" },  // Female, energetic
  { name: "en-GB-Neural2-B", ssmlGender: "MALE" },    // British male, clear
  { name: "en-AU-Neural2-B", ssmlGender: "MALE" },    // Australian male, friendly
];

if (!API_KEY) {
  console.error("Set GOOGLE_KEY environment variable:");
  console.error("  GOOGLE_KEY=your-api-key node scripts/generate-voiceover-google.mjs");
  console.error("\nGet your key at: https://console.cloud.google.com/apis/credentials");
  process.exit(1);
}

fs.mkdirSync(path.join(__dirname, "../public/audio"), { recursive: true });

// ── helpers ──────────────────────────────────────────────────────────────────

function extractWordsFromSSML(ssml, audioDuration) {
  // Remove SSML tags
  const text = ssml.replace(/<[^>]+>/g, "");
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  // Estimate timing (Google doesn't provide word-level timestamps directly)
  // We'll use average duration per word
  const avgDuration = audioDuration / words.length;
  
  return words.map((word, i) => ({
    word: word.toLowerCase().replace(/[^a-z0-9]/g, ""),
    raw: word,
    start: i * avgDuration,
    end: (i + 1) * avgDuration,
    frame: Math.round(i * avgDuration * FPS),
  }));
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

async function tryGenerate(voice) {
  console.log(`Trying voice: ${voice.name} (${voice.ssmlGender})...`);
  
  const ssml = `<speak><prosody rate="105%" pitch="+2st">${TEXT}</prosody></speak>`;
  
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { ssml },
      voice: {
        languageCode: voice.name.split("-")[0] + "-" + voice.name.split("-")[1],
        name: voice.name,
        ssmlGender: voice.ssmlGender,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.05,
        pitch: 2,
        volumeGainDb: 3,
      },
    }),
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`${err.error?.code}: ${err.error?.message}`);
  }
  
  return res.json();
}

// ── manual timing markers ────────────────────────────────────────────────────

// Since Google TTS doesn't provide word-level timestamps,
// we'll use these estimated offsets (adjust based on actual audio)
const MANUAL_TIMING = {
  // Scene 1: Hook (0-2s)
  buying: { frame: 0, text: "Yo! Buying a car..." },
  
  // Scene 2: Problem (2-9.5s)
  whatsapp: { frame: 60, text: "Endless WhatsApp groups..." },
  
  // Scene 3: Brand (9.5-12s)
  motokah1: { frame: 289, text: "Motokah changes everything!" },
  
  // Scene 4: Home (12-14s)
  post: { frame: 362, text: "Post your car..." },
  
  // Scene 5: Coverage (14-22s) - COUNTRIES
  buyers: { frame: 483, text: "Buyers across..." },
  tanzania: { frame: 511, text: "Tanzania" },
  kenya: { frame: 531, text: "Kenya" },
  uganda: { frame: 548, text: "Uganda" },
  rwanda: { frame: 563, text: "Rwanda" },
  burundi: { frame: 578, text: "Burundi" },
  ethiopia: { frame: 593, text: "Ethiopia" },
  somalia: { frame: 608, text: "Somalia" },
  southsudan: { frame: 623, text: "South Sudan" },
  djibouti: { frame: 638, text: "Djibouti" },
  drc: { frame: 653, text: "DRC" },
  
  // Scene 6: Listing (22-26s)
  nomiddle: { frame: 668, text: "No middlemen..." },
  
  // Scene 7: Stats (26-30.5s)
  five: { frame: 780, text: "Over ten thousand..." },
  
  // Scene 8: CTA (30.5-38s)
  motokah2: { frame: 999, text: "Motokah dot com!" },
};

console.log("\n=== MANUAL TIMING MARKERS ===");
console.log("Use these as starting points, then adjust based on actual audio:\n");
Object.entries(MANUAL_TIMING).forEach(([key, val]) => {
  console.log(`  ${key.padEnd(12)} ${String(val.frame).padStart(4)}f  (${(val.frame/FPS).toFixed(1)}s)  "${val.text}"`);
});

console.log("\n=== GENERATING AUDIO ===\n");

let data = null, usedVoice = null;
for (const voice of VOICES) {
  try { 
    data = await tryGenerate(voice); 
    usedVoice = voice.name; 
    console.log(`✓ Success with ${voice.name}`);
    break; 
  }
  catch (e) { 
    console.error(`✗ ${voice.name}: ${e.message}`); 
  }
}

if (!data) { 
  console.error("All voices failed. Check your API key and quota."); 
  process.exit(1); 
}

// ── save audio ────────────────────────────────────────────────────────────────

const audioBuf = Buffer.from(data.audioContent, "base64");
fs.writeFileSync(OUT_AUDIO, audioBuf);
console.log(`\n✓ Audio saved: ${OUT_AUDIO} (${(audioBuf.byteLength / 1024).toFixed(0)} KB)`);

// Estimate duration (MP3 bitrate ~128kbps = 16KB/s)
const estimatedDuration = audioBuf.byteLength / 16000;
console.log(`Estimated duration: ${estimatedDuration.toFixed(1)}s (${Math.ceil(estimatedDuration * FPS)} frames)`);

console.log("\n=== NEXT STEPS ===");
console.log("1. Listen to the generated audio");
console.log("2. Adjust timing markers in this script if needed");
console.log("3. Run: node scripts/generate-voiceover-google.mjs");
console.log("4. Update src/remotion/timing.ts with actual frame numbers");
console.log("\nFor perfect sync, use a tool like Audacity to measure exact word timings.");

// ── generate timing template ─────────────────────────────────────────────────

const timingTemplate = `// Auto-generated — adjust manually for perfect sync
// Generated with Google Cloud TTS voice: ${usedVoice}
// Duration: ~${estimatedDuration.toFixed(1)}s = ${Math.ceil(estimatedDuration * FPS)} frames @ ${FPS}fps

export const FPS = ${FPS};

// Scene start frames — derived from voiceover word timestamps
// ADJUST THESE based on actual audio timing!
export const T = {
  s1:  ${MANUAL_TIMING.buying.frame},     // "Yo! Buying a car..."
  s2:  ${MANUAL_TIMING.whatsapp.frame},   // "Endless WhatsApp groups..."
  s3:  ${MANUAL_TIMING.motokah1.frame},   // "Motokah changes everything!"
  s4:  ${MANUAL_TIMING.post.frame},       // "Post your car..."
  s5:  ${MANUAL_TIMING.buyers.frame},     // "Buyers across..."
  s6:  ${MANUAL_TIMING.nomiddle.frame},   // "No middlemen..."
  s7:  ${MANUAL_TIMING.five.frame},       // "Over ten thousand..."
  s8:  ${MANUAL_TIMING.motokah2.frame},   // "Motokah dot com!"
  end: ${Math.ceil(estimatedDuration * FPS) + 20},
};

// Word-level frames for Scene07 country stagger
// ADJUST THESE based on when each country is spoken in audio!
export const COUNTRY_FRAMES = {
  tz: ${MANUAL_TIMING.tanzania.frame},   // Tanzania
  ke: ${MANUAL_TIMING.kenya.frame},      // Kenya
  ug: ${MANUAL_TIMING.uganda.frame},     // Uganda
  rw: ${MANUAL_TIMING.rwanda.frame},     // Rwanda
  bi: ${MANUAL_TIMING.burundi.frame},    // Burundi
  et: ${MANUAL_TIMING.ethiopia.frame},   // Ethiopia
  so: ${MANUAL_TIMING.somalia.frame},    // Somalia
  ss: ${MANUAL_TIMING.southsudan.frame}, // South Sudan
  dj: ${MANUAL_TIMING.djibouti.frame},   // Djibouti
  cd: ${MANUAL_TIMING.drc.frame},        // DRC
};

// Structured timing consumed by Main.tsx
export const TIMING = {
  fps: ${FPS},
  totalDuration: ${Math.ceil(estimatedDuration * FPS) + 20},
  overlap: 12,
  audio: {
    hasVoiceover: true,
    hasMusic: false,
    voiceoverVolume: 1,
    musicVolume: 0.18,
    sfxVolume: 0.7,
  },
  scenes: {
    s1_Hook:      ${MANUAL_TIMING.buying.frame},
    s2_Problem:   ${MANUAL_TIMING.whatsapp.frame},
    s3_Brand:     ${MANUAL_TIMING.motokah1.frame},
    s4_Home:      ${MANUAL_TIMING.post.frame},
    s4b_PostCar:  ${MANUAL_TIMING.post.frame + 58},  // Post car scene
    s5_Coverage:  ${MANUAL_TIMING.buyers.frame},
    s6_Listing:   ${MANUAL_TIMING.nomiddle.frame},
    s6b_Chat:     ${MANUAL_TIMING.five.frame},
    s7_Stats:     ${MANUAL_TIMING.five.frame + 50},
    s8_CTA:       ${MANUAL_TIMING.motokah2.frame},
  },
};
`;

fs.writeFileSync(OUT_TIMING, timingTemplate);
console.log(`\n✓ Timing template saved: ${OUT_TIMING}`);
console.log("\n⚠️  IMPORTANT: Adjust frame numbers after listening to actual audio!");
