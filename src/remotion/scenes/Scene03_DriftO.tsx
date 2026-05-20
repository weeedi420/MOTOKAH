import { interpolate, useCurrentFrame } from "remotion";
import { CarSVG } from "../components/CarSVG";
import { NeonTrail } from "../components/NeonTrail";

const RADIUS = 120;
const CIRC = 2 * Math.PI * RADIUS;
const CX = 640 / 2; // viewBox center
const CY = 360 / 2;

function SmokePuff({ angle, delay, frame }: { angle: number; delay: number; frame: number }) {
  const f = frame - delay;
  if (f < 0) return null;
  const s = interpolate(f, [0, 30], [0.3, 2.8], { extrapolateRight: "clamp" });
  const op = interpolate(f, [0, 8, 30], [0.8, 0.55, 0], { extrapolateRight: "clamp" });
  const x = CX + Math.cos(angle) * RADIUS;
  const y = CY + Math.sin(angle) * RADIUS;
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      width: 32, height: 24,
      background: "radial-gradient(ellipse, rgba(180,210,255,0.55) 0%, transparent 70%)",
      transform: `translate(-50%,-50%) scale(${s})`,
      opacity: op, filter: "blur(5px)",
    }} />
  );
}

export function Scene03_DriftO() {
  const frame = useCurrentFrame();

  const DRIFT_FRAMES = 240;
  const progress = interpolate(frame, [0, DRIFT_FRAMES], [0, 1], { extrapolateRight: "clamp" });
  const angle = -Math.PI / 2 + progress * Math.PI * 2;

  const cx = CX + Math.cos(angle) * RADIUS;
  const cy = CY + Math.sin(angle) * RADIUS;
  const carRotation = (angle * 180) / Math.PI + 90;

  const strokeDashoffset = interpolate(frame, [0, DRIFT_FRAMES], [CIRC, 0], { extrapolateRight: "clamp" });
  const oGlowOp = interpolate(frame, [DRIFT_FRAMES - 30, DRIFT_FRAMES + 20], [0, 1], { extrapolateRight: "clamp" });

  // Completion explosion at frame 240+
  const explodeParticles = Array.from({ length: 40 }, (_, i) => {
    const a = (i / 40) * Math.PI * 2;
    const f2 = frame - DRIFT_FRAMES;
    const dist = interpolate(f2, [0, 40], [0, 180 + (i % 6) * 20], { extrapolateRight: "clamp" });
    const op = interpolate(f2, [0, 12, 45], [0, 1, 0], { extrapolateRight: "clamp" });
    return { x: CX + Math.cos(a) * dist, y: CY + Math.sin(a) * dist, op };
  });

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [280, 320], [1, 0], { extrapolateRight: "clamp" });

  // Smoke puffs around the path
  const smokePuffs = Array.from({ length: 8 }, (_, i) => ({
    angle: -Math.PI / 2 + (i / 7) * Math.PI * 2,
    delay: Math.round((i / 7) * DRIFT_FRAMES),
  }));

  // Tyre tracks
  const trackCount = Math.floor(progress * 30);

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 50%, #0c1828 0%, #020508 80%)",
      opacity: bgOp * fadeOut,
    }}>
      {/* SVG layer (circle + glow + NeonTrail) */}
      <svg style={{ position: "absolute", inset: 0 }}
        width="100%" height="100%" viewBox={`0 0 640 360`}>
        <defs>
          <filter id="oGlowF">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Outer glow ring */}
        <circle cx={CX} cy={CY} r={RADIUS}
          fill="none" stroke="#0099FF" strokeWidth={20}
          opacity={oGlowOp * 0.35}
          style={{ filter: "blur(14px)" }}
        />
        {/* Completion burst ring */}
        <circle cx={CX} cy={CY} r={RADIUS + interpolate(frame - DRIFT_FRAMES, [0, 50], [0, 80], { extrapolateRight: "clamp" })}
          fill="none" stroke="#00D4FF" strokeWidth={3}
          opacity={interpolate(frame - DRIFT_FRAMES, [0, 10, 50], [0, 0.9, 0], { extrapolateRight: "clamp" })}
        />
        {/* Drawing circle */}
        <circle cx={CX} cy={CY} r={RADIUS}
          fill="none" stroke="#0099FF" strokeWidth={3}
          strokeDasharray={CIRC} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ filter: oGlowOp > 0.3 ? "url(#oGlowF)" : undefined }}
        />
        {/* NeonTrail */}
        <NeonTrail cx={CX} cy={CY} radius={RADIUS} totalFrames={DRIFT_FRAMES} color="#0099FF" />

        {/* Tyre track dots */}
        {Array.from({ length: trackCount }, (_, i) => {
          const tAngle = -Math.PI / 2 + (i / 29) * progress * Math.PI * 2;
          const tx = CX + Math.cos(tAngle) * (RADIUS - 8);
          const ty = CY + Math.sin(tAngle) * (RADIUS - 8);
          return (
            <circle key={i} cx={tx} cy={ty} r={2.5}
              fill="rgba(180,220,255,0.35)"
            />
          );
        })}

        {/* Explosion particles */}
        {frame > DRIFT_FRAMES && explodeParticles.map((p, i) => (
          <circle key={i}
            cx={p.x} cy={p.y} r={4}
            fill={i % 3 === 0 ? "#E8A835" : "#0099FF"}
            opacity={p.op}
            style={{ filter: `drop-shadow(0 0 5px ${i % 3 === 0 ? "#E8A835" : "#0099FF"})` }}
          />
        ))}
      </svg>

      {/* Smoke puffs */}
      {smokePuffs.map((p, i) => (
        <SmokePuff key={i} angle={p.angle} delay={p.delay} frame={frame} />
      ))}

      {/* Car on drift path */}
      <div style={{
        position: "absolute",
        left: `calc(${(cx / 640) * 100}% - 105px)`,
        top: `calc(${(cy / 360) * 100}% - 38px)`,
        transform: `rotate(${carRotation}deg)`,
        filter: "drop-shadow(0 4px 20px rgba(0,153,255,0.55))",
        opacity: progress < 1 ? 1 : interpolate(frame - DRIFT_FRAMES, [0, 20], [1, 0], { extrapolateRight: "clamp" }),
      }}>
        <CarSVG scale={0.75} headlightsOn={true} wheelSpeed={16} showUnderglow={true} />
      </div>

      {/* Label */}
      <div style={{
        position: "absolute", bottom: "8%", left: "50%", transform: "translateX(-50%)",
        color: "rgba(0,153,255,0.5)", fontSize: 11, fontFamily: "Inter, sans-serif",
        letterSpacing: 6, fontWeight: 700,
        opacity: interpolate(frame, [15, 50], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        TRACING THE PERFECT O
      </div>
    </div>
  );
}
