// Auto-generated — adjust manually for perfect sync
// 10 East African countries + accurate city counts
// Duration: ~38.3s = 1148 frames @ 30fps

export const FPS = 30;

// Scene start frames — adjust based on actual voiceover timing
export const T = {
  s1:  0,    // "Yo! Buying a car..."
  s2:  60,   // "Endless WhatsApp groups..."
  s3:  289,  // "Motokah changes everything!"
  s4:  362,  // "Post your car..."
  s5:  420,  // "...in just 2 minutes, free"
  s6:  483,  // "Buyers across..."
  s7:  668,  // "No middlemen..."
  s8:  780,  // "Just your car, your price"
  s9:  917,  // "Over ten thousand..."
  s10: 999,  // "Motokah dot com!"
  end: 1148,
};

// Word-level frames for Scene07 country stagger
// All 10 East African countries
export const COUNTRY_FRAMES = {
  tz: 511,  // Tanzania
  ke: 531,  // Kenya
  ug: 548,  // Uganda
  rw: 563,  // Rwanda
  bi: 578,  // Burundi
  et: 593,  // Ethiopia
  so: 608,  // Somalia
  ss: 623,  // South Sudan
  dj: 638,  // Djibouti
  cd: 653,  // DRC
};

// Structured timing consumed by Main.tsx
export const TIMING = {
  fps: 30,
  totalDuration: 1148,
  overlap: 12,
  audio: {
    hasVoiceover: false,
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
