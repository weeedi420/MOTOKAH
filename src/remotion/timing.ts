// TIMING synced to actual voiceover: 39.55s = 1186 frames @ 30fps
// Voice: Ayinde (young British Nigerian)
// THIS IS THE ORIGINAL PERFECT SYNC - DO NOT CHANGE

export const FPS = 30;

// Scene start frames - synced to actual voiceover timing
export const T = {
  s1:  0,     // "Buying a car..." (0.0s)
  s2:  135,   // "Endless WhatsApp groups..." (4.5s)
  s3:  285,   // "Motokah changes everything!" (9.5s)
  s4:  375,   // "Post your car..." (12.5s)
  s5:  435,   // "...in just 2 minutes" (14.5s)
  s6:  480,   // "Buyers across..." (16.0s)
  s7:  690,   // "No middlemen..." (23.0s)
  s8:  795,   // "Just your car..." (26.5s)
  s9:  900,   // "Over ten thousand..." (30.0s)
  s10: 1050,  // "Motokah dot com!" (35.0s)
  end: 1186,  // End (39.55s)
};

// Country frame offsets (within Coverage scene)
export const COUNTRY_FRAMES = {
  tz: 525,  // Tanzania (17.5s)
  ke: 549,  // Kenya (18.3s)
  ug: 570,  // Uganda (19.0s)
  rw: 591,  // Rwanda (19.7s)
  et: 615,  // Ethiopia (20.5s)
  cd: 636,  // DRC (21.2s)
};

// Structured timing consumed by Main.tsx
export const TIMING = {
  fps: 30,
  totalDuration: 1186,
  overlap: 0,  // NO OVERLAP - prevents phone clipping between scenes
  audio: {
    hasVoiceover: true,
    hasMusic: false,
    voiceoverVolume: 1,
    musicVolume: 0.18,
    sfxVolume: 0.7,
  },
  scenes: {
    s1_Hook:      0,
    s2_Problem:   135,
    s3_Brand:     285,
    s4_Home:      375,
    s4b_PostCar:  435,
    s5_Coverage:  480,
    s6_Listing:   690,
    s6b_Chat:     795,
    s7_Stats:     900,
    s8_CTA:       1050,
  },
};
