/**
 * Generate Motokah promo voiceover using Edge TTS (completely FREE)
 * No API key needed! Uses Microsoft Edge's neural voices.
 * 
 * Usage: npx edge-tts --text "Your text" --write-media output.mp3
 * Or run: node scripts/generate-voiceover-edge.mjs
 * 
 * Best African-sounding voices:
 * - en-US-GuyNeural (male, warm)
 * - en-US-JennyNeural (female, energetic)
 * - en-GB-RyanNeural (male, clear British)
 * - en-AU-WilliamNeural (male, friendly Australian)
 * 
 * Saves: public/audio/voiceover.mp3 + timing guidance
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUT_AUDIO  = path.join(__dirname, "../public/audio/voiceover.mp3");
const OUT_SUBS   = path.join(__dirname, "../public/audio/voiceover.vtt");

const FPS = 30;

// Updated script with ALL East African countries
const TEXT = `Yo! Buying a car in East Africa used to be a headache. Endless WhatsApp groups, random listings, and sketchy prices? Not anymore! Motokah changes everything! Post your car in just two minutes — completely free! Buyers across Tanzania, Kenya, Uganda, Rwanda, Burundi, Ethiopia, Somalia, South Sudan, Djibouti, and DRC find you directly! No middlemen. No commission. Just your car, your price, your deal! Over ten thousand verified listings across ten countries on one massive platform! Motokah dot com! Let's go!`;

// Try these voices in order (all free, high quality)
const VOICES = [
  "en-US-GuyNeural",       // Male, warm, professional
  "en-US-JennyNeural",     // Female, energetic
  "en-GB-RyanNeural",      // Male, clear British accent
  "en-AU-WilliamNeural",   // Male, friendly Australian
];

console.log("=== Edge TTS Voice Generator (FREE) ===\n");
console.log("This uses Microsoft's free Edge TTS - no API key needed!\n");

// Check if edge-tts is installed
function checkEdgeTTS() {
  try {
    execSync("npx edge-tts --help", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

if (!checkEdgeTTS()) {
  console.log("Installing edge-tts...");
  try {
    execSync("npm install -g edge-tts", { stdio: "inherit" });
  } catch {
    console.error("Failed to install edge-tts. Try manually:");
    console.error("  npm install -g edge-tts");
    process.exit(1);
  }
}

fs.mkdirSync(path.join(__dirname, "../public/audio"), { recursive: true });

// Generate voiceover with each voice option
let success = false;
for (const voice of VOICES) {
  console.log(`\nTrying voice: ${voice}...`);
  try {
    // Generate audio with subtitles (for timing)
    const cmd = `npx edge-tts --voice "${voice}" --text "${TEXT}" --write-media "${OUT_AUDIO}" --write-subtitles "${OUT_SUBS}"`;
    
    execSync(cmd, { stdio: "pipe", timeout: 60000 });
    
    // Check if file was created
    if (fs.existsSync(OUT_AUDIO)) {
      const stats = fs.statSync(OUT_AUDIO);
      console.log(`✓ Success! Generated: ${OUT_AUDIO}`);
      console.log(`  Size: ${(stats.size / 1024).toFixed(0)} KB`);
      console.log(`  Voice: ${voice}`);
      success = true;
      break;
    }
  } catch (e) {
    console.error(`✗ ${voice} failed: ${e.message}`);
  }
}

if (!success) {
  console.error("\nAll voices failed. Try:");
  console.error("  1. Check internet connection");
  console.error("  2. Install manually: npm install -g edge-tts");
  console.error("  3. Try: npx edge-tts --list-voices");
  process.exit(1);
}

// ── Parse subtitle file for timing ────────────────────────────────────────────

function parseSubtitles(vttPath) {
  if (!fs.existsSync(vttPath)) return null;
  
  const content = fs.readFileSync(vttPath, "utf-8");
  const cues = [];
  
  // Simple VTT parser
  const lines = content.split("\n");
  let currentCue = null;
  
  for (const line of lines) {
    const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (timeMatch) {
      currentCue = {
        start: timeToSeconds(timeMatch[1]),
        end: timeToSeconds(timeMatch[2]),
        text: "",
      };
    } else if (currentCue && line.trim() && !line.includes("WEBVTT")) {
      currentCue.text += line.trim() + " ";
      if (line.trim().endsWith(".")) {
        cues.push(currentCue);
        currentCue = null;
      }
    }
  }
  
  return cues;
}

function timeToSeconds(timeStr) {
  const [h, m, s] = timeStr.split(":");
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s);
}

const cues = parseSubtitles(OUT_SUBS);

if (cues && cues.length > 0) {
  console.log("\n=== EXTRACTED TIMINGS ===");
  console.log("(Use these to update src/remotion/timing.ts)\n");
  
  cues.forEach((cue, i) => {
    const startFrame = Math.round(cue.start * FPS);
    const text = cue.text.substring(0, 50);
    console.log(`  ${String(startFrame).padStart(4)}f  ${cue.start.toFixed(2)}s  "${text}..."`);
  });
}

// ── Manual timing template ───────────────────────────────────────────────────

console.log("\n=== MANUAL TIMING TEMPLATE ===");
console.log("Copy these into src/remotion/timing.ts:\n");

const template = `// Generated with Edge TTS (FREE)
// Voice: [SELECTED_VOICE]
// Duration: ~38s @ ${FPS}fps

export const FPS = ${FPS};

export const T = {
  s1:  0,     // "Yo! Buying a car..."
  s2:  60,    // "Endless WhatsApp groups..."
  s3:  289,   // "Motokah changes everything!"
  s4:  362,   // "Post your car..."
  s5:  420,   // "...in just 2 minutes"
  s6:  483,   // "Buyers across..."
  s7:  668,   // "No middlemen..."
  s8:  780,   // "Just your car..."
  s9:  917,   // "Over ten thousand..."
  s10: 999,   // "Motokah dot com!"
  end: 1148,
};

export const COUNTRY_FRAMES = {
  tz: 511,  // Tanzania
  ke: 528,  // Kenya
  ug: 543,  // Uganda
  rw: 558,  // Rwanda
  bi: 573,  // Burundi
  et: 588,  // Ethiopia
  so: 603,  // Somalia
  ss: 618,  // South Sudan
  dj: 633,  // Djibouti
  cd: 648,  // DRC
};

export const TIMING = {
  fps: ${FPS},
  totalDuration: 1148,
  overlap: 12,
  audio: {
    hasVoiceover: true,
    hasMusic: false,
    voiceoverVolume: 1,
    musicVolume: 0.18,
    sfxVolume: 0.7,
  },
  scenes: {
    s1_Hook:      0,
    s2_Problem:   60,
    s3_Brand:     289,
    s4_Home:      362,
    s4b_PostCar:  420,
    s5_Coverage:  483,
    s6_Listing:   668,
    s6b_Chat:     780,
    s7_Stats:     917,
    s8_CTA:       999,
  },
};
`;

console.log(template);

console.log("\n=== INSTRUCTIONS ===");
console.log("1. Listen to the generated audio file");
console.log("2. Open the VTT subtitle file for exact word timings");
console.log("3. Update frame numbers in timing.ts");
console.log("4. For perfect sync, use a tool like Audacity to measure exact timings");
console.log("\n✓ Files saved:");
console.log(`  Audio: ${OUT_AUDIO}`);
console.log(`  Subtitles: ${OUT_SUBS}`);
