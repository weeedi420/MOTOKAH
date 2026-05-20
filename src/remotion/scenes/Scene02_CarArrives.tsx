import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CarSVG } from "../components/CarSVG";

function RoadLine({ xOffset, y }: { xOffset: number; y: number }) {
  return (
    <div style={{
      position: "absolute", left: xOffset, top: `${y}%`,
      width: 52, height: 3,
      background: "linear-gradient(to right, transparent, rgba(0,153,255,0.3), transparent)",
      borderRadius: 2,
    }} />
  );
}

export function Scene02_CarArrives() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [285, 320], [1, 0], { extrapolateRight: "clamp" });

  // Headlight beams appear first (frames 0-30), before car is visible
  const beamOp = interpolate(frame, [0, 25], [0, 0.7], { extrapolateRight: "clamp" });
  // Car itself fades in at frame 20
  const carOp = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });

  // Car spring arrival from right
  const carSpring = spring({ frame: frame - 15, fps, config: { stiffness: 55, damping: 18 } });
  const carX = interpolate(carSpring, [0, 1], [500, 0]);

  // Suspension bounce after stop
  const bounceAmt = frame > 120 ? Math.sin((frame - 120) * 0.35) * Math.exp(-(frame - 120) * 0.025) * 8 : 0;

  // Camera shake on screech (frames 110-135)
  const shakeX = frame > 108 && frame < 138
    ? Math.sin(frame * 2.2) * interpolate(frame, [108, 138], [7, 0])
    : 0;
  const shakeY = frame > 108 && frame < 138
    ? Math.cos(frame * 3.1) * interpolate(frame, [108, 138], [4, 0])
    : 0;

  // Impact white flash at frame 112-118
  const impactFlash = interpolate(frame, [112, 115, 120], [0, 0.85, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Tire smoke cloud
  const smokeOp = interpolate(frame, [108, 120, 160], [0, 0.7, 0], { extrapolateRight: "clamp" });
  const smokeW = interpolate(frame, [108, 155], [20, 120], { extrapolateRight: "clamp" });

  // Motion blur: heavy when arriving, disappears as spring settles
  const motionBlur = interpolate(carSpring, [0, 0.5, 0.85, 1], [16, 8, 2, 0]);

  // Scrolling road
  const roadScroll = (frame * 14) % 90;

  // Speed lines (appear early then fade)
  const speedLineOp = interpolate(frame, [0, 30, 100, 120], [0, 0.8, 0.5, 0], { extrapolateRight: "clamp" });

  // "GET READY" subtitle
  const subtitleOp = interpolate(frame, [150, 180], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 65%, #060d18 0%, #020508 80%)",
      opacity: bgOp * fadeOut,
      transform: `translate(${shakeX}px, ${shakeY}px)`,
    }}>
      {/* Road surface */}
      <div style={{ position: "absolute", bottom: "20%", left: 0, right: 0, height: "22%" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,20,40,0.6), transparent)",
        }} />
        {/* Dashed center line */}
        <div style={{
          position: "absolute", top: "30%", left: 0, right: 0,
          height: 3, overflow: "hidden",
        }}>
          <div style={{
            display: "flex", gap: 60,
            transform: `translateX(-${roadScroll}px)`,
            width: "200%",
          }}>
            {Array.from({ length: 24 }, (_, i) => (
              <RoadLine key={i} xOffset={0} y={0} />
            ))}
          </div>
        </div>
      </div>

      {/* Speed lines */}
      {[30, 35, 40, 44, 48, 52, 56, 60].map((y, i) => {
        const lineW = interpolate(frame, [i * 4, i * 4 + 25], [0, 100 + i * 12], { extrapolateRight: "clamp" });
        return (
          <div key={i} style={{
            position: "absolute",
            right: "14%", top: `${y}%`,
            width: lineW, height: 1.5,
            background: "linear-gradient(to left, transparent, rgba(0,153,255,0.55))",
            opacity: speedLineOp,
          }} />
        );
      })}

      {/* Headlight beam (appears before car) */}
      <svg style={{ position: "absolute", inset: 0, opacity: beamOp * carOp }}
        width="100%" height="100%" viewBox="0 0 1280 720">
        <defs>
          <radialGradient id="hlCone" cx="0%" cy="50%" r="100%">
            <stop offset="0%" stopColor="#ffffee" stopOpacity={0.8} />
            <stop offset="40%" stopColor="#ffffcc" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#ffffa0" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* Position matches car center + headlight offset */}
        <polygon
          points={`${755 + carX},430 1280,280 1280,560`}
          fill="url(#hlCone)"
          opacity={0.5}
        />
      </svg>

      {/* Car */}
      <div style={{
        position: "absolute",
        left: `calc(50% + ${carX}px - 210px)`,
        bottom: "23%",
        transform: `translateY(${bounceAmt}px)`,
        opacity: carOp,
        filter: "drop-shadow(0 10px 30px rgba(0,153,255,0.35))",
      }}>
        <CarSVG
          scale={1.4}
          motionBlur={motionBlur}
          headlightsOn={true}
          wheelSpeed={frame < 120 ? 14 : 0}
        />
      </div>

      {/* Tire smoke */}
      <div style={{
        position: "absolute", left: "52%", bottom: "26%",
        width: smokeW, height: 50,
        background: "radial-gradient(ellipse, rgba(180,200,230,0.35) 0%, transparent 70%)",
        transform: "translateX(-50%)",
        opacity: smokeOp,
        filter: "blur(10px)",
      }} />

      {/* Impact flash */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#ffffff",
        opacity: impactFlash,
        pointerEvents: "none",
      }} />

      {/* Subtitle */}
      <div style={{
        position: "absolute", bottom: "8%", left: "50%", transform: "translateX(-50%)",
        color: "rgba(0,153,255,0.55)", fontSize: 11, fontFamily: "Inter, sans-serif",
        letterSpacing: 7, fontWeight: 700,
        opacity: subtitleOp,
      }}>
        MOTOKAH · THE MARKETPLACE
      </div>

      {/* Ground reflection */}
      <div style={{
        position: "absolute", bottom: "20%", left: "35%",
        width: 360, height: 30,
        background: "radial-gradient(ellipse, rgba(0,153,255,0.12) 0%, transparent 70%)",
        opacity: carOp,
      }} />
    </div>
  );
}
