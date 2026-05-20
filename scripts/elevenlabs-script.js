/**
 * ELEVENLABS VOICEOVER SCRIPT
 * ============================
 * Copy this ENTIRE text and paste into ElevenLabs:
 * https://elevenlabs.io/app/speech-synthesis
 * 
 * Recommended voice: "Adam" or "Arnold" (professional, energetic)
 * Or use African-accented voice if available
 * 
 * Settings:
 * - Stability: 0.35 (more expressive)
 * - Similarity: 0.85
 * - Style: 0.45 (energetic)
 * - Speaker Boost: ON
 * 
 * Model: eleven_multilingual_v2
 */

// SCRIPT TEXT - COPY FROM HERE TO ELEVENLABS:
/*

Yo! Buying a car in East Africa used to be a total headache. Endless WhatsApp groups, random listings, sketchy prices? Not anymore! Motokah changes everything! Post your car in just two minutes. Completely free. Buyers across Tanzania, Kenya, Uganda, Rwanda, Ethiopia, and DRC find you directly. No middlemen. No commission. Just your car, your price, your deal! Over ten thousand verified listings across East Africa on one massive platform! Motokah dot com! Let's go!

*/
// END OF SCRIPT TEXT

// TIMING MARKERS (for manual sync after generating):
// Use these timestamps to update timing.ts
// 
// Word/Phrase              | Estimated Time | Frame @ 30fps
// -------------------------|---------------|--------------
// "Yo! Buying..."          | 0.0s          | 0
// "Endless WhatsApp..."    | 2.0s          | 60
// "Motokah changes..."     | 9.5s          | 285
// "Post your car..."       | 12.0s         | 360
// "...two minutes"         | 13.5s         | 405
// "Buyers across..."       | 15.5s         | 465
// "Tanzania"               | 16.5s         | 495
// "Kenya"                  | 17.2s         | 516
// "Uganda"                 | 17.8s         | 534
// "Rwanda"                 | 18.4s         | 552
// "Ethiopia"               | 19.0s         | 570
// "DRC"                    | 19.6s         | 588
// "No middlemen..."        | 21.0s         | 630
// "Just your car..."       | 24.0s         | 720
// "Over ten thousand..."   | 27.0s         | 810
// "Motokah dot com!"       | 31.0s         | 930
// END                      | 35.0s         | 1050

// After generating audio:
// 1. Download the MP3
// 2. Place in: public/audio/voiceover.mp3
// 3. Measure exact word timings in Audacity
// 4. Update src/remotion/timing.ts with actual frames
// 5. Set hasVoiceover: true in timing.ts
// 6. Re-render video

console.log("ElevenLabs Script Ready!");
console.log("Copy the text between /* */ markers and paste into ElevenLabs.");
