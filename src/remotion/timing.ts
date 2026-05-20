// TIMING synced to actual voiceover: 64.63s = 1939 frames @ 30fps
// Voice: Ayinde (young British Nigerian) - FULL VERSION

export const FPS = 30;

// Scene start frames - synced to longer voiceover with more wording
export const T = {
  s1:  0,     // "Buying a car in East Africa..."
  s2:  180,   // "Endless WhatsApp groups..."
  s3:  420,   // "Motokah..."
  s4:  600,   // "For sellers..."
  s5:  750,   // "Easy listing..."
  s6:  960,   // "Buyers across..."
  s7:  1260,  // "No middlemen..."
  s8:  1440,  // "Your car..."
  s9:  1590,  // "Over ten thousand..."
  s10: 1740,  // "Gari yako..."
  end: 1939,  // End (64.63s)
};

// Country frame offsets (within Coverage scene) - more time to show each
export const COUNTRY_FRAMES = {
  tz: 1020,  // Tanzania
  ke: 1050,  // Kenya
  ug: 1080,  // Uganda
  rw: 1110,  // Rwanda
  et: 1140,  // Ethiopia
  cd: 1170,  // DRC
};

// Structured timing consumed by Main.tsx
export const TIMING = {
  fps: 30,
  totalDuration: 1939,
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
    s2_Problem:   180,
    s3_Brand:     420,
    s4_Home:      600,
    s4b_PostCar:  750,
    s5_Coverage:  960,
    s6_Listing:   1260,
    s6b_Chat:     1440,
    s7_Stats:     1590,
    s8_CTA:       1740,
  },
};
