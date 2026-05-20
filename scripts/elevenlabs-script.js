/**
 * ELEVENLABS VOICEOVER SCRIPT - MOTOKAH PROMO v2
 * ================================================
 * 
 * THIS IS THE FINAL SCRIPT - READY TO PASTE INTO ELEVENLABS
 * 
 * How to use:
 * 1. Go to https://elevenlabs.io/app/speech-synthesis
 * 2. Select Voice: "Ayinde" (young British Nigerian)
 * 3. Set Model: eleven_multilingual_v2
 * 4. Copy the text between the ====== lines below
 * 5. Paste into the text box
 * 6. Apply Settings (listed below)
 * 7. Click Generate
 * 
 * ================================================================
 * 
 * VOICE SETTINGS (Apply these exactly):
 * - Stability: 0.28 (more variation = more natural)
 * - Similarity: 0.80 (clear but not robotic)
 * - Style: 0.55 (energetic but not shouting)
 * - Speaker Boost: ON
 * - Model: eleven_multilingual_v2
 * 
 * ================================================================
 * 
 * WHY THIS SCRIPT IS BETTER:
 * - Uses <break time="Xs" /> tags for PERFECT pauses
 * - Uses ALL CAPS for emphasis (ElevenLabs reads these louder)
 * - Uses ellipses (...) for natural trailing
 * - Pacing matches the video scenes exactly
 * - ~39.5 seconds total duration
 * 
 * ================================================================
 */

const ELEVENLABS_SCRIPT = `
<break time="0.3s" />

Yo! <break time="0.2s" /> Buying a car in East Africa?

<break time="0.8s" />

Used to be a total headache. <break time="0.3s" /> Endless WhatsApp groups... <break time="0.2s" /> random listings... <break time="0.2s" /> sketchy prices?

<break time="0.6s" />

NOT ANYMORE!

<break time="0.5s" />

MOTOKAH changes EVERYTHING!

<break time="0.4s" />

Post your car in just TWO MINUTES. <break time="0.2s" /> Completely FREE.

<break time="0.5s" />

Buyers across Tanzania... <break time="0.15s" /> Kenya... <break time="0.15s" /> Uganda... <break time="0.15s" /> Rwanda... <break time="0.15s" /> Ethiopia... <break time="0.15s" /> and DRC find you directly.

<break time="0.5s" />

NO MIDDLEMEN. <break time="0.2s" /> NO COMMISSION.

<break time="0.4s" />

Just YOUR car. <break time="0.2s" /> YOUR price. <break time="0.2s" /> YOUR deal!

<break time="0.5s" />

Over TEN THOUSAND verified listings across East Africa on ONE massive platform!

<break time="0.6s" />

Motokah... <break time="0.3s" /> dot... <break time="0.3s" /> com!

<break time="0.8s" />

Let's GO!

<break time="0.3s" />
`;

// Export for use
module.exports = { ELEVENLABS_SCRIPT };

console.log("✅ ElevenLabs Script Ready!");
console.log("✅ Duration: ~39.5 seconds");
console.log("✅ File: scripts/ELEVENLABS_SCRIPT.txt (copy-paste ready)");
console.log("");
console.log("INSTRUCTIONS:");
console.log("1. Open: https://elevenlabs.io/app/speech-synthesis");
console.log("2. Voice: Ayinde (young British Nigerian)");
console.log("3. Settings: Stability 0.28, Similarity 0.80, Style 0.55");
console.log("4. Copy text from: scripts/ELEVENLABS_SCRIPT.txt");
console.log("5. Paste and Generate!");
