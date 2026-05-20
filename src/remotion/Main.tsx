import { AbsoluteFill, Audio, Sequence, spring, useCurrentFrame } from "remotion";
import { TIMING } from "./timing";
import { colorGrade, SPRING } from "./design";
import { Scene01_Hook }    from "./scenes/Scene01_Hook";
import { Scene02_Problem } from "./scenes/Scene02_Problem";
import { Scene03_Brand }   from "./scenes/Scene03_Brand";
import { Scene04_Home }    from "./scenes/Scene04_Home";
import { Scene04b_PostCar } from "./scenes/Scene04b_PostCar";
import { Scene05_Search }  from "./scenes/Scene05_Search";
import { Scene06_Listing } from "./scenes/Scene06_Listing";
import { Scene06b_Chat }   from "./scenes/Scene06b_Chat";
import { Scene07_Countries } from "./scenes/Scene07_Countries";
import { Scene08_Stats }   from "./scenes/Scene08_Stats";
import { Scene09_CTA }     from "./scenes/Scene09_CTA";

const T = TIMING.scenes;
const OVR = TIMING.overlap;
const { hasVoiceover, hasMusic, musicVolume, voiceoverVolume, sfxVolume } = TIMING.audio;

// Cinematic scene transition component
function SceneTransition({ from, duration = 15 }: { from: number; duration?: number }) {
  const frame = useCurrentFrame();
  const t = Math.max(0, Math.min(1, (frame - from) / duration));
  const s = spring({ frame: t * 30, fps: 30, config: SPRING.snap });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#0A0A0F",
        opacity: s * 0.3,
        zIndex: 50,
        pointerEvents: "none",
      }}
    />
  );
}

export function MotokahPromo() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "#0A0A0F",
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Cinematic color grade overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: colorGrade.warmOverlay,
          pointerEvents: "none",
          zIndex: 90,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: colorGrade.vignette,
          pointerEvents: "none",
          zIndex: 91,
        }}
      />

      {/* Audio layers */}
      {hasVoiceover && (
        <Audio
          src="/audio/voiceover.mp3"
          startFrom={0}
          volume={voiceoverVolume}
        />
      )}

      {hasMusic && (
        <Audio
          src="/audio/ambient.mp3"
          startFrom={0}
          volume={musicVolume}
          loop
        />
      )}

      {/* Scene 1: Hook */}
      <Sequence from={T.s1_Hook} durationInFrames={T.s2_Problem - T.s1_Hook + OVR}>
        <Scene01_Hook />
      </Sequence>

      {/* Scene 2: Problem */}
      <Sequence from={T.s2_Problem} durationInFrames={T.s3_Brand - T.s2_Problem + OVR}>
        <Scene02_Problem />
      </Sequence>
      <SceneTransition from={T.s2_Problem} />

      {/* Scene 3: Brand */}
      <Sequence from={T.s3_Brand} durationInFrames={T.s4_Home - T.s3_Brand + OVR}>
        <Scene03_Brand />
      </Sequence>
      <SceneTransition from={T.s3_Brand} />

      {/* Scene 4: Home */}
      <Sequence from={T.s4_Home} durationInFrames={T.s4b_PostCar - T.s4_Home + OVR}>
        <Scene04_Home />
      </Sequence>
      <SceneTransition from={T.s4_Home} />

      {/* Scene 4b: Post Car */}
      <Sequence from={T.s4b_PostCar} durationInFrames={T.s5_Search - T.s4b_PostCar + OVR}>
        <Scene04b_PostCar />
      </Sequence>
      <SceneTransition from={T.s4b_PostCar} />

      {/* Scene 5: Search */}
      <Sequence from={T.s5_Search} durationInFrames={T.s6_Listing - T.s5_Search + OVR}>
        <Scene05_Search />
      </Sequence>
      <SceneTransition from={T.s5_Search} />

      {/* Scene 6: Listing */}
      <Sequence from={T.s6_Listing} durationInFrames={T.s6b_Chat - T.s6_Listing + OVR}>
        <Scene06_Listing />
      </Sequence>
      <SceneTransition from={T.s6_Listing} />

      {/* Scene 6b: Chat */}
      <Sequence from={T.s6b_Chat} durationInFrames={T.s7_Countries - T.s6b_Chat + OVR}>
        <Scene06b_Chat />
      </Sequence>
      <SceneTransition from={T.s6b_Chat} />

      {/* Scene 7: Countries (replaces map) */}
      <Sequence from={T.s7_Countries} durationInFrames={T.s8_Stats - T.s7_Countries + OVR}>
        <Scene07_Countries />
      </Sequence>
      <SceneTransition from={T.s7_Countries} />

      {/* Scene 8: Stats */}
      <Sequence from={T.s8_Stats} durationInFrames={T.s9_CTA - T.s8_Stats + OVR}>
        <Scene08_Stats />
      </Sequence>
      <SceneTransition from={T.s8_Stats} />

      {/* Scene 9: CTA */}
      <Sequence from={T.s9_CTA} durationInFrames={TIMING.totalDuration - T.s9_CTA}>
        <Scene09_CTA />
      </Sequence>

      {/* Sound effects */}
      {/* Whoosh on brand reveal */}
      {frame === T.s3_Brand + 5 && (
        <Audio src="/audio/sfx/whoosh.mp3" volume={sfxVolume} />
      )}

      {/* Gentle chime on brand name */}
      {frame === T.s3_Brand + 25 && (
        <Audio src="/audio/sfx/chime.mp3" volume={sfxVolume * 0.7} />
      )}

      {/* Click on CTA cursor */}
      {frame === T.s9_CTA + 60 && (
        <Audio src="/audio/sfx/click-soft.mp3" volume={sfxVolume} />
      )}
    </AbsoluteFill>
  );
}
