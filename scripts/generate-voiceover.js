import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "TX3LPaxmHKxFdv7VOQHJ"; // Liam - Energetic, Social Media Creator
const OUTPUT_PATH = path.join(__dirname, "..", "public", "audio", "voiceover.mp3");

if (!API_KEY) {
  console.error("❌ Set ELEVENLABS_API_KEY env var");
  process.exit(1);
}

// Script with natural pauses — ~55s when spoken at speed 0.92
const SCRIPT = `Buying a car in East Africa...

Just got easier!

No more WhatsApp groups.
No more random listings.
No more vague prices.

There's a better way.

Introducing...

Motokah!

Verified listings.
Real prices.
Across five countries.

Search for your perfect ride.
Toyota Hilux...
Land Cruiser...
Vitz...
It's all here.

Connect directly with the seller on WhatsApp.
One message...
Deal done!

Asante sana!

From Tanzania...
to Kenya...
Uganda...
Rwanda...
and Burundi.

Over ten thousand listings.
Five countries.
Completely free.

Gari yako...
bei yako.

Your car...
your price.

Visit motokah.com today!`;

async function generate() {
  console.log("🎙️  Generating voiceover with ElevenLabs...");
  console.log(`   Voice ID: ${VOICE_ID}`);
  console.log(`   Voice: Liam - Energetic Social Media Creator`);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
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
          stability: 0.30,
          similarity_boost: 0.90,
          style: 0.75,
          use_speaker_boost: true,
          speed: 0.92,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("❌ ElevenLabs error:", err);
    process.exit(1);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, buffer);

  console.log(`✅ Saved to ${OUTPUT_PATH} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

generate().catch((e) => {
  console.error(e);
  process.exit(1);
});
