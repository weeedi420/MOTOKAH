import { AbsoluteFill, Audio, Sequence } from "remotion";
import { Scene01_Hook }    from "./scenes/Scene01_Hook";
import { Scene02_Problem } from "./scenes/Scene02_Problem";
import { Scene03_Brand }   from "./scenes/Scene03_Brand";
import { Scene04_Home }    from "./scenes/Scene04_Home";
import { Scene04b_PostCar } from "./scenes/Scene04b_PostCar";
import { Scene05_Search }  from "./scenes/Scene05_Search";
import { Scene06_Listing } from "./scenes/Scene06_Listing";
import { Scene06b_Chat }   from "./scenes/Scene06b_Chat";
import { Scene07_Map }     from "./scenes/Scene07_Map";
import { Scene08_Stats }   from "./scenes/Scene08_Stats";
import { Scene09_CTA }     from "./scenes/Scene09_CTA";

// TOTAL: 50.39s @ 30fps = 1512 frames
// TIGHTER TIMINGS - everything is faster to match energetic audio

const T = {
  s1:     0,    // Hook: "Buying a car in East Africa..." (0-3s)
  s2:    90,    // Problem: "No more WhatsApp groups..." (3-7.3s)
  s3:   220,    // Brand: "Introducing Motokah!" (7.3-11s)
  s4:   330,    // Home: "Verified listings..." (11-14.3s)
  s4b:  430,    // Post Car: "Post in 2 minutes" (14.3-18.3s)
  s5:   550,    // Search: "Search for your perfect ride..." (18.3-23.3s)
  s6:   700,    // Listing: Car details (23.3-27.3s)
  s6b:  820,    // Chat: "Chat, Call, WhatsApp" (27.3-32s)
  s7:   960,    // Map: East Africa coverage (32-37s)
  s8:  1110,    // Stats: "10K+ listings..." (37-40.7s)
  s9:  1220,    // CTA: "Gari yako, bei yako" (40.7-50.4s)
  end: 1512,
};

const OVR = 6; // Very short overlap for snappy transitions

const HAS_VOICEOVER = true;
const HAS_MUSIC = false;

export function MotokahPromo() {
  return (
    <AbsoluteFill style={{ background: "#FFFFFF", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Main voiceover */}
      {HAS_VOICEOVER && (
        <Audio src="/audio/voiceover.mp3" startFrom={0} volume={1} />
      )}

      <Sequence from={T.s1} durationInFrames={T.s2 - T.s1 + OVR}>
        <Scene01_Hook />
      </Sequence>
      <Sequence from={T.s2} durationInFrames={T.s3 - T.s2 + OVR}>
        <Scene02_Problem />
      </Sequence>
      <Sequence from={T.s3} durationInFrames={T.s4 - T.s3 + OVR}>
        <Scene03_Brand />
      </Sequence>
      <Sequence from={T.s4} durationInFrames={T.s4b - T.s4 + OVR}>
        <Scene04_Home />
      </Sequence>
      <Sequence from={T.s4b} durationInFrames={T.s5 - T.s4b + OVR}>
        <Scene04b_PostCar />
      </Sequence>
      <Sequence from={T.s5} durationInFrames={T.s6 - T.s5 + OVR}>
        <Scene05_Search />
      </Sequence>
      <Sequence from={T.s6} durationInFrames={T.s6b - T.s6 + OVR}>
        <Scene06_Listing />
      </Sequence>
      <Sequence from={T.s6b} durationInFrames={T.s7 - T.s6b + OVR}>
        <Scene06b_Chat />
      </Sequence>
      <Sequence from={T.s7} durationInFrames={T.s8 - T.s7 + OVR}>
        <Scene07_Map />
      </Sequence>
      <Sequence from={T.s8} durationInFrames={T.s9 - T.s8 + OVR}>
        <Scene08_Stats />
      </Sequence>
      <Sequence from={T.s9} durationInFrames={T.end - T.s9}>
        <Scene09_CTA />
      </Sequence>
    </AbsoluteFill>
  );
}
