import { AbsoluteFill, Audio, Sequence } from "remotion";
import { TIMING } from "./timing";
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

const T = TIMING.scenes;
const OVR = TIMING.overlap;
const { hasVoiceover, hasMusic, voiceoverVolume } = TIMING.audio;

export function MotokahPromo() {
  return (
    <AbsoluteFill style={{ background: "#FFFFFF", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Main voiceover */}
      {hasVoiceover && (
        <Audio src="/audio/voiceover.mp3" startFrom={0} volume={voiceoverVolume} />
      )}

      <Sequence from={T.s1_Hook} durationInFrames={T.s2_Problem - T.s1_Hook + OVR}>
        <Scene01_Hook />
      </Sequence>
      <Sequence from={T.s2_Problem} durationInFrames={T.s3_Brand - T.s2_Problem + OVR}>
        <Scene02_Problem />
      </Sequence>
      <Sequence from={T.s3_Brand} durationInFrames={T.s4_Home - T.s3_Brand + OVR}>
        <Scene03_Brand />
      </Sequence>
      <Sequence from={T.s4_Home} durationInFrames={T.s4b_PostCar - T.s4_Home + OVR}>
        <Scene04_Home />
      </Sequence>
      <Sequence from={T.s4b_PostCar} durationInFrames={T.s5_Search - T.s4b_PostCar + OVR}>
        <Scene04b_PostCar />
      </Sequence>
      <Sequence from={T.s5_Search} durationInFrames={T.s6_Listing - T.s5_Search + OVR}>
        <Scene05_Search />
      </Sequence>
      <Sequence from={T.s6_Listing} durationInFrames={T.s6b_Chat - T.s6_Listing + OVR}>
        <Scene06_Listing />
      </Sequence>
      <Sequence from={T.s6b_Chat} durationInFrames={T.s7_Map - T.s6b_Chat + OVR}>
        <Scene06b_Chat />
      </Sequence>
      <Sequence from={T.s7_Map} durationInFrames={T.s8_Stats - T.s7_Map + OVR}>
        <Scene07_Map />
      </Sequence>
      <Sequence from={T.s8_Stats} durationInFrames={T.s9_CTA - T.s8_Stats + OVR}>
        <Scene08_Stats />
      </Sequence>
      <Sequence from={T.s9_CTA} durationInFrames={TIMING.totalDuration - T.s9_CTA}>
        <Scene09_CTA />
      </Sequence>
    </AbsoluteFill>
  );
}
