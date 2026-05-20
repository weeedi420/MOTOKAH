// TIMING synced to ACTUAL AUDIO ANALYSIS
// Audio: 64.63s = 1938 frames
// Analyzed with ffmpeg silence detection

export const FPS = 30;

// Grouped speech segments into scenes based on natural pauses
export const T = {
  // Scene 1: HOOK (0-8.5s) - "Buying a car... just got easier" + pause
  s1:  0,     // "Buying a car in East Africa just got easier"
  
  // Scene 2: PROBLEM (8.5-16.5s) - "Endless WhatsApp... Not anymore"
  s2:  257,   // "Endless WhatsApp groups..."
  
  // Scene 3: BRAND (16.5-21s) - "Motokah changes everything"
  s3:  464,   // "Motokah changes everything"
  
  // Scene 4: HOME/POSTCAR (21-28s) - "Post your car..."
  s4:  611,   // "Post your car in just two minutes"
  s5:  753,   // "Completely free" + "Buyers across..."
  
  // Scene 5: COVERAGE (28-38.5s) - Countries
  s6:  859,   // "Tanzania... DRC" (starts at 28.6s)
  
  // Scene 6: LISTING (38.5-44s) - "No middlemen"
  s7:  1043,  // "No middlemen..."
  
  // Scene 7: CHAT (44-48.5s) - "Your car..."
  s8:  1275,  // "Just your car..."
  
  // Scene 8: STATS (48.5-55s) - "Over ten thousand"
  s9:  1462,  // "Over ten thousand..."
  
  // Scene 9: CTA (55-64.6s) - "Gari yako... Motokah dot com"
  s10: 1687,  // "Gari yako..."
  end: 1938,  // End (64.63s)
};

// Country frames - spread across Coverage scene (28.6s to 38.5s)
export const COUNTRY_FRAMES = {
  tz: 900,   // Tanzania (~30s)
  ke: 938,   // Kenya (~31.3s)
  ug: 980,   // Uganda (~32.7s)
  rw: 1031,  // Rwanda (~34.4s)
  et: 1078,  // Ethiopia (~35.9s)
  cd: 1156,  // DRC (~38.5s)
};

export const TIMING = {
  fps: 30,
  totalDuration: 1938,
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
    s2_Problem:   257,
    s3_Brand:     464,
    s4_Home:      611,
    s4b_PostCar:  753,
    s5_Coverage:  859,
    s6_Listing:   1043,
    s6b_Chat:     1275,
    s7_Stats:     1462,
    s8_CTA:       1687,
  },
};
