import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.ELEVENLABS_API_KEY;

// Try African voices first
const VOICE_IDS = [
  "KfOKur2SDMsqQVcT1wKb", // Primary African voice
  "77aEIu0qStu8Jwv1EdhX", // Fallback African voice
];

const OUTPUT_PATH = path.join(__dirname, "..", "public", "audio", "voiceover.mp3");
const TIMESTAMPS_PATH = path.join(__dirname, "..", "src", "remotion", "voiceover-timestamps.json");

if (!API_KEY) {
  console.error("❌ Set ELEVENLABS_API_KEY env var");
  process.exit(1);
}

// Script optimized for "Moo-toh-kahhh" pronunciation and dramatic pauses
const SCRIPT = `Buying a car in East Africa... just got easier!

No more WhatsApp groups. No more random listings. No more vague prices.

There's a better way.

Introducing... Moo-toh-kahhh!

Verified listings. Real prices. Across five countries.

Search for your perfect ride. Toyota Hilux. Land Cruiser. Vitz. It's all here.

Connect directly with the seller on WhatsApp. One message. Deal done!

Asante sana!

From Tanzania... to Kenya... Uganda... Rwanda... and Burundi.

Over ten thousand listings. Five countries. Completely free.

Gari yako... bei yako.

Your car... your price.

Visit motokah.com today!`;

async function generateWithVoice(voiceId) {
  console.log(`🎙️  Generating voiceover with ElevenLabs...`);
  console.log(`   Voice ID: ${voiceId}`);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: SCRIPT,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.85,
          style: 0.65,
          use_speaker_boost: true,
          speed: 0.88,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("❌ ElevenLabs error:", err);
    return null;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, buffer);

  console.log(`✅ Audio saved to ${OUTPUT_PATH} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return voiceId;
}

async function getTimestamps(voiceId) {
  console.log(`\n📊 Fetching word-level timestamps...`);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: SCRIPT,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.85,
          style: 0.65,
          use_speaker_boost: true,
          speed: 0.88,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("❌ Timestamp error:", err);
    return null;
  }

  const data = await res.json();

  // Save full response
  fs.writeFileSync(TIMESTAMPS_PATH, JSON.stringify(data, null, 2));
  console.log(`✅ Timestamps saved to ${TIMESTAMPS_PATH}`);

  // Print full response
  console.log("\n📋 FULL TIMESTAMP RESPONSE:");
  console.log(JSON.stringify(data, null, 2));

  return data;
}

async function main() {
  let usedVoiceId = null;

  for (const voiceId of VOICE_IDS) {
    console.log(`\n🎯 Trying voice: ${voiceId}`);
    const result = await generateWithVoice(voiceId);
    if (result) {
      usedVoiceId = result;
      break;
    }
  }

  if (!usedVoiceId) {
    console.error("❌ All voices failed");
    process.exit(1);
  }

  console.log(`\n🎵 Using voice: ${usedVoiceId}`);

  // Get timestamps
  const timestampData = await getTimestamps(usedVoiceId);

  if (!timestampData || !timestampData.alignment) {
    console.error("❌ No timestamp data received");
    process.exit(1);
  }

  // Parse and print key phrase timestamps
  console.log("\n📍 KEY PHRASE TIMESTAMPS:");
  console.log("========================");

  const { characters, character_start_times_seconds, character_end_times_seconds } = timestampData.alignment;

  // Build word-level timestamps
  let currentWord = "";
  let wordStart = 0;
  const words = [];

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];

    if (char === " " || char === "\n") {
      if (currentWord) {
        words.push({
          word: currentWord,
          start: wordStart,
          end: character_end_times_seconds[i - 1],
        });
        currentWord = "";
      }
    } else {
      if (!currentWord) {
        wordStart = character_start_times_seconds[i];
      }
      currentWord += char;
    }
  }

  if (currentWord) {
    words.push({
      word: currentWord,
      start: wordStart,
      end: character_end_times_seconds[characters.length - 1],
    });
  }

  // Print key words
  const keyPhrases = [
    "Buying", "East", "Africa", "easier",
    "No", "more", "WhatsApp",
    "Introducing",
    "Moo-toh-kahhh",
    "Verified", "listings",
    "Search", "perfect", "ride",
    "Toyota", "Hilux", "Land", "Cruiser", "Vitz",
    "Connect", "directly", "WhatsApp",
    "Asante", "sana",
    "Tanzania", "Kenya", "Uganda", "Rwanda", "Burundi",
    "ten", "thousand", "listings",
    "Gari", "yako", "bei", "yako",
    "Your", "car", "your", "price",
    "Visit", "motokah.com", "today"
  ];

  words.forEach(({ word, start, end }) => {
    if (keyPhrases.some(kp => word.toLowerCase().includes(kp.toLowerCase()))) {
      console.log(`  ${word.padEnd(15)} @ ${start.toFixed(3)}s - ${end.toFixed(3)}s (${Math.round(start * 30)}f - ${Math.round(end * 30)}f)`);
    }
  });

  // Calculate scene start frames
  console.log("\n🎬 SCENE START FRAMES (30fps):");
  console.log("================================");

  const sceneMarkers = [
    { scene: "s1_Hook", keyword: "Buying", offset: 0 },
    { scene: "s2_Problem", keyword: "No", offset: 0 },
    { scene: "s3_Brand", keyword: "Introducing", offset: 0 },
    { scene: "s4_Home", keyword: "Verified", offset: 0 },
    { scene: "s4b_PostCar", keyword: "Search", offset: 0 },
    { scene: "s5_Search", keyword: "Toyota", offset: 0 },
    { scene: "s6_Listing", keyword: "Connect", offset: 0 },
    { scene: "s6b_Chat", keyword: "Asante", offset: 0 },
    { scene: "s7_Countries", keyword: "Tanzania", offset: 0 },
    { scene: "s8_Stats", keyword: "ten", offset: 0 },
    { scene: "s9_CTA", keyword: "Gari", offset: 0 },
  ];

  const sceneFrames = {};

  sceneMarkers.forEach(({ scene, keyword }) => {
    const word = words.find(w => w.word.toLowerCase().includes(keyword.toLowerCase()));
    if (word) {
      const frame = Math.round(word.start * 30);
      sceneFrames[scene] = frame;
      console.log(`  ${scene.padEnd(15)}: frame ${frame} (${word.start.toFixed(2)}s) — "${word.word}"`);
    }
  });

  // Write timing.ts
  const totalDuration = Math.round(words[words.length - 1].end * 30) + 60; // +2s buffer

  const timingContent = `// AUTO-GENERATED from voiceover timestamps
// Generated at: ${new Date().toISOString()}
// Voice ID: ${usedVoiceId}
// Total audio duration: ${(totalDuration / 30).toFixed(2)}s

export const TIMING = {
  fps: 30,
  totalDuration: ${totalDuration},

  scenes: {
    s1_Hook:      ${sceneFrames.s1_Hook || 0},    // "Buying a car in East Africa..."
    s2_Problem:   ${sceneFrames.s2_Problem || 90},   // "No more WhatsApp groups..."
    s3_Brand:     ${sceneFrames.s3_Brand || 200},  // "Introducing Moo-toh-kahhh!"
    s4_Home:      ${sceneFrames.s4_Home || 320},  // "Verified listings..."
    s4b_PostCar:  ${sceneFrames.s4b_PostCar || 420},  // "Search for your perfect ride..."
    s5_Search:    ${sceneFrames.s5_Search || 520},  // "Toyota Hilux..."
    s6_Listing:   ${sceneFrames.s6_Listing || 640},  // "Connect directly..."
    s6b_Chat:     ${sceneFrames.s6b_Chat || 760},  // "Asante sana!"
    s7_Countries: ${sceneFrames.s7_Countries || 880},  // "Tanzania..."
    s8_Stats:     ${sceneFrames.s8_Stats || 1000}, // "Over ten thousand listings..."
    s9_CTA:       ${sceneFrames.s9_CTA || 1120}, // "Gari yako..."
  },

  overlap: 4,

  audio: {
    hasVoiceover: true,
    hasMusic: true,
    musicVolume: 0.15,
    voiceoverVolume: 1,
    autoSyncToVoiceover: true,
  },
} as const;

export function getSceneDuration(sceneKey: keyof typeof TIMING.scenes): number {
  const keys = Object.keys(TIMING.scenes) as (keyof typeof TIMING.scenes)[];
  const idx = keys.indexOf(sceneKey);
  if (idx === -1) return 0;
  const nextKey = keys[idx + 1];
  if (!nextKey) return TIMING.totalDuration - TIMING.scenes[sceneKey];
  return TIMING.scenes[nextKey] - TIMING.scenes[sceneKey];
}

export function getSceneEnd(sceneKey: keyof typeof TIMING.scenes): number {
  const keys = Object.keys(TIMING.scenes) as (keyof typeof TIMING.scenes)[];
  const idx = keys.indexOf(sceneKey);
  if (idx === -1) return 0;
  const nextKey = keys[idx + 1];
  if (!nextKey) return TIMING.totalDuration;
  return TIMING.scenes[nextKey];
}
`;

  fs.writeFileSync(
    path.join(__dirname, "..", "src", "remotion", "timing.ts"),
    timingContent
  );

  console.log(`\n✅ timing.ts updated with audio-synced frame numbers`);
  console.log(`   Total duration: ${totalDuration} frames (${(totalDuration / 30).toFixed(1)}s)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
