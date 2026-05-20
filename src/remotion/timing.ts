// TIMING CONFIGURATION - Edit these values to adjust scene timings
// Run `npx remotion studio` to preview changes in real-time
// Frame numbers are at 30fps. To convert seconds to frames: seconds × 30

export const TIMING = {
  fps: 30,
  totalDuration: 1512, // 50.4s total
  
  // Scene start frames (automatically calculated durations)
  scenes: {
    s1_Hook:      0,    // "Buying a car in East Africa..."
    s2_Problem:   90,   // "No more WhatsApp groups..."
    s3_Brand:     220,  // "Introducing Motokah!"
    s4_Home:      330,  // "Verified listings..."
    s4b_PostCar:  430,  // "Post in 2 minutes"
    s5_Search:    550,  // "Search for your perfect ride..."
    s6_Listing:   700,  // Car details
    s6b_Chat:     820,  // "Chat, Call, WhatsApp"
    s7_Map:       960,  // East Africa coverage
    s8_Stats:     1110, // "10K+ listings..."
    s9_CTA:       1220, // "Gari yako, bei yako"
  },
  
  // Transition overlap between scenes (frames)
  overlap: 6,
  
  // Audio settings
  audio: {
    hasVoiceover: true,
    hasMusic: false,
    voiceoverVolume: 1,
    // Set to true to auto-sync scene timings to voiceover markers
    autoSyncToVoiceover: false,
  },
} as const;

// Helper to calculate scene durations
export function getSceneDuration(sceneKey: keyof typeof TIMING.scenes): number {
  const keys = Object.keys(TIMING.scenes) as (keyof typeof TIMING.scenes)[];
  const idx = keys.indexOf(sceneKey);
  if (idx === -1) return 0;
  const nextKey = keys[idx + 1];
  if (!nextKey) return TIMING.totalDuration - TIMING.scenes[sceneKey];
  return TIMING.scenes[nextKey] - TIMING.scenes[sceneKey];
}

// Helper to get end frame of a scene
export function getSceneEnd(sceneKey: keyof typeof TIMING.scenes): number {
  const keys = Object.keys(TIMING.scenes) as (keyof typeof TIMING.scenes)[];
  const idx = keys.indexOf(sceneKey);
  if (idx === -1) return 0;
  const nextKey = keys[idx + 1];
  if (!nextKey) return TIMING.totalDuration;
  return TIMING.scenes[nextKey];
}
