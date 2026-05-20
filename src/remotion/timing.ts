// SNAPPY TIMING - optimized for energetic voiceover
// Duration: ~35s = 1050 frames @ 30fps

export const FPS = 30;

// Scene start frames - tight, snappy timing like SaaS videos
export const T = {
  s1:  0,    // "Yo! Buying a car..."
  s2:  60,   // "Endless WhatsApp groups..."
  s3:  285,  // "Motokah changes everything!"
  s4:  360,  // "Post your car..."
  s5:  405,  // "...in just 2 minutes"
  s6:  465,  // "Buyers across..."
  s7:  630,  // "No middlemen..."
  s8:  720,  // "Just your car..."
  s9:  810,  // "Over ten thousand..."
  s10: 930,  // "Motokah dot com!"
  end: 1050,
};

// Country frame offsets (within Scene 6)
export const COUNTRY_FRAMES = {
  tz: 495,  // Tanzania
  ke: 516,  // Kenya
  ug: 534,  // Uganda
  rw: 552,  // Rwanda
  et: 570,  // Ethiopia
  cd: 588,  // DRC
};

// Structured timing consumed by Main.tsx
export const TIMING = {
  fps: 30,
  totalDuration: 1050,
  overlap: 8,  // Tighter transitions
  audio: {
    hasVoiceover: false,  // Set to true after adding voiceover.mp3
    hasMusic: false,
    voiceoverVolume: 1,
    musicVolume: 0.18,
    sfxVolume: 0.7,
  },
  scenes: {
    s1_Hook:      0,
    s2_Problem:   60,
    s3_Brand:     285,
    s4_Home:      360,
    s4b_PostCar:  405,
    s5_Coverage:  465,
    s6_Listing:   630,
    s6b_Chat:     720,
    s7_Stats:     810,
    s8_CTA:       930,
  },
};
