/**
 * Generate Motokah promo voiceover via ElevenLabs.
 * Usage: ELEVEN_KEY=sk_xxx node scripts/generate-voiceover.mjs
 *
 * Saves output to: public/audio/voiceover.mp3
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH  = path.join(__dirname, "../public/audio/voiceover.mp3");

const API_KEY  = process.env.ELEVEN_KEY;
const VOICE_ID = "77aEIu0qStu8Jwv1EdhX"; // youthful enthusiastic voice

const TEXT = `
Yo! Buying a car in East Africa used to be a headache. Endless WhatsApp groups, random listings, and sketchy prices? Not anymore!
Motokah changes everything!
Post your car in just two minutes — completely free!
Buyers across Tanzania, Kenya, Uganda, Rwanda, and Burundi find you directly!
No middlemen. No commission.
Just your car, your price, your deal!
Over ten thousand verified listings across five countries on one massive platform!
Motokah dot com! Let's go!
`.trim();

if (!API_KEY) {
  console.error("Set ELEVEN_KEY env variable first:\n  ELEVEN_KEY=sk_xxx node scripts/generate-voiceover.mjs");
  process.exit(1);
}

fs.mkdirSync(path.join(__dirname, "../public/audio"), { recursive: true });

const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
  method: "POST",
  headers: {
    "xi-api-key": API_KEY,
    "Content-Type": "application/json",
    "Accept": "audio/mpeg",
  },
  body: JSON.stringify({
    text: TEXT,
    model_id: "eleven_multilingual_v2",
    voice_settings: { stability: 0.45, similarity_boost: 0.82, style: 0.3, use_speaker_boost: true },
  }),
});

if (!res.ok) {
  const err = await res.text();
  console.error("ElevenLabs error:", err);
  process.exit(1);
}

const buf = await res.arrayBuffer();
fs.writeFileSync(OUT_PATH, Buffer.from(buf));
console.log(`Saved to ${OUT_PATH} (${(buf.byteLength / 1024).toFixed(0)} KB)`);
