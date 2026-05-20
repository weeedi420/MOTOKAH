// TIMING CONFIGURATION
// Frame numbers at 30fps based on estimated speech pacing
// Regenerate with: node scripts/generate-voiceover.js (requires ELEVENLABS_API_KEY)

export const TIMING = {
  fps: 30,
  totalDuration: 1440, // ~48s total with buffer

  scenes: {
    s1_Hook:      0,     // "Buying a car in East Africa..." (0s)
    s2_Problem:   105,   // "No more WhatsApp groups..." (3.5s)
    s3_Brand:     240,   // "Introducing... Moo-toh-kahhh!" (8s)
    s4_Home:      405,   // "Verified listings..." (13.5s)
    s4b_PostCar:  495,   // "Search for your perfect ride..." (16.5s)
    s5_Search:    645,   // "Toyota Hilux..." (21.5s)
    s6_Listing:   765,   // "Connect directly..." (25.5s)
    s6b_Chat:     825,   // "Asante sana!" (27.5s)
    s7_Countries: 870,   // "Tanzania... Kenya..." (29s)
    s8_Stats:     990,   // "Over ten thousand listings..." (33s)
    s9_CTA:       1110,  // "Gari yako..." (37s)
  },

  overlap: 3,

  audio: {
    hasVoiceover: true,
    hasMusic: true,
    musicVolume: 0.12,
    voiceoverVolume: 1,
    sfxVolume: 0.4,
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

// Audio marker phrases for visual sync
export const AUDIO_MARKERS = {
  hook: { start: 0, phrase: "Buying a car in East Africa" },
  problem: { start: 3.5, phrase: "No more WhatsApp groups" },
  brand: { start: 8, phrase: "Introducing" },
  motokah: { start: 9.5, phrase: "Moo-toh-kahhh" },
  search: { start: 16.5, phrase: "Search for your perfect ride" },
  connect: { start: 21.5, phrase: "Connect directly" },
  countries: { start: 29, phrase: "Tanzania" },
  stats: { start: 33, phrase: "ten thousand listings" },
  cta: { start: 37, phrase: "Gari yako" },
  url: { start: 42, phrase: "motokah.com" },
} as const;

export function markerToFrame(marker: keyof typeof AUDIO_MARKERS): number {
  return Math.round(AUDIO_MARKERS[marker].start * TIMING.fps);
}
