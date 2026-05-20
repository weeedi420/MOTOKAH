import { Composition, registerRoot } from "remotion";
import { MotokahPromo } from "./Main";
import { TIMING } from "./timing";

function RemotionRoot() {
  return (
    <Composition
      id="MotokahPromo"
      component={MotokahPromo}
      durationInFrames={TIMING.totalDuration}
      fps={TIMING.fps}
      width={1280}
      height={720}
    />
  );
}

registerRoot(RemotionRoot);
