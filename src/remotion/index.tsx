import { Composition, registerRoot } from "remotion";
import { MotokahPromo } from "./Main";
import { MotokahPremiumAd } from "./PremiumAd";
import { TIMING } from "./timing";

function RemotionRoot() {
  return (
    <>
      <Composition
        id="MotokahPromo"
        component={MotokahPromo}
        durationInFrames={TIMING.totalDuration}
        fps={TIMING.fps}
        width={1280}
        height={720}
      />
      <Composition
        id="MotokahPremiumAd"
        component={MotokahPremiumAd}
        durationInFrames={210}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
}

registerRoot(RemotionRoot);
