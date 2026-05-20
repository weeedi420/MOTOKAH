/**
 * Generate Motokah promo voiceover using Microsoft Edge TTS API (completely FREE)
 * No API key needed! Uses Edge's neural voices directly.
 * 
 * Usage: node scripts/generate-voiceover-free.mjs
 * 
 * Saves: public/audio/voiceover.mp3
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUT_AUDIO  = path.join(__dirname, "../public/audio/voiceover.mp3");

const FPS = 30;

// Updated script with ALL East African countries
const TEXT = `Yo! Buying a car in East Africa used to be a headache. Endless WhatsApp groups, random listings, and sketchy prices? Not anymore! Motokah changes everything! Post your car in just two minutes — completely free! Buyers across Tanzania, Kenya, Uganda, Rwanda, Burundi, Ethiopia, Somalia, South Sudan, Djibouti, and DRC find you directly! No middlemen. No commission. Just your car, your price, your deal! Over ten thousand verified listings across ten countries on one massive platform! Motokah dot com! Let's go!`;

// Microsoft Edge TTS voices (free, high quality)
const VOICES = [
  { name: "en-US-GuyNeural",       desc: "Male, warm, professional" },
  { name: "en-US-JennyNeural",     desc: "Female, energetic" },
  { name: "en-GB-RyanNeural",      desc: "Male, clear British" },
  { name: "en-AU-WilliamNeural",   desc: "Male, friendly Australian" },
];

console.log("=== FREE Voice Generator (Microsoft Edge TTS) ===\n");
console.log("No API key needed! Completely free.\n");

fs.mkdirSync(path.join(__dirname, "../public/audio"), { recursive: true });

// Edge TTS API endpoint
const EDGE_TTS_URL = "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/v1";

async function generateVoice(voice, text) {
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="${voice}">
      <prosody rate="+10%" pitch="+5%">${text}</prosody>
    </voice>
  </speak>`;

  try {
    const res = await fetch(EDGE_TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: ssml,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(OUT_AUDIO, buffer);
    
    return buffer.byteLength;
  } catch (e) {
    throw new Error(`Failed: ${e.message}`);
  }
}

// Try each voice
let success = false;
for (const voice of VOICES) {
  console.log(`Trying: ${voice.name} (${voice.desc})...`);
  try {
    const size = await generateVoice(voice.name, TEXT);
    console.log(`✓ Success! ${(size / 1024).toFixed(0)} KB`);
    console.log(`  Saved: ${OUT_AUDIO}`);
    success = true;
    break;
  } catch (e) {
    console.error(`✗ ${e.message}`);
  }
}

if (!success) {
  console.error("\nAll attempts failed. Alternative: Use Python edge-tts");
  console.error("  pip install edge-tts");
  console.error("  edge-tts --voice en-US-GuyNeural --text \"Your text\" --write-media output.mp3");
  process.exit(1);
}

// ── Estimate timing ──────────────────────────────────────────────────────────

// Rough estimate: ~150 words, average speaking rate ~130-150 WPM
// At 140 WPM: 150 words = 64 seconds... but our script is ~100 words
const wordCount = TEXT.split(/\s+/).length;
const estimatedDuration = (wordCount / 140) * 60; // seconds at 140 WPM
const estimatedFrames = Math.ceil(estimatedDuration * FPS);

console.log(`\nEstimated duration: ${estimatedDuration.toFixed(1)}s (${estimatedFrames} frames)`);
console.log(`Word count: ${wordCount}`);

console.log("\n=== NEXT STEPS ===");
console.log("1. Listen to the generated audio");
console.log("2. Use Audacity or similar to measure exact word timings");
console.log("3. Update src/remotion/timing.ts with actual frame numbers");
console.log("\n=== TIMING TEMPLATE ===");
console.log(`
export const FPS = ${FPS};

export const T = {
  s1:  0,      // "Yo! Buying a car..."
  s2:  60,     // "Endless WhatsApp groups..."
  s3:  289,    // "Motokah changes everything!"
  s4:  362,    // "Post your car..."
  s5:  420,    // "...in just 2 minutes"
  s6:  483,    // "Buyers across..."
  s7:  668,    // "No middlemen..."
  s8:  780,    // "Just your car..."
  s9:  917,    // "Over ten thousand..."
  s10: 999,    // "Motokah dot com!"
  end: ${estimatedFrames + 20},
};

export const COUNTRY_FRAMES = {
  tz: 511,  ke: 528,  ug: 543,  rw: 558,  bi: 573,
  et: 588,  so: 603,  ss: 618,  dj: 633,  cd: 648,
};
`);
