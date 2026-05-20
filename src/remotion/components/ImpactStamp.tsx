import { useCurrentFrame, interpolate, spring, useVideoConfig } from "../frame";

interface ImpactStampProps {
  letter: string;
  delay: number; // frame offset for this letter
  fontSize?: number;
  color?: string;
  glowColor?: string;
}

export function ImpactStamp({
  letter,
  delay,
  fontSize = 80,
  color = "#0099FF",
  glowColor = "#0099FF",
}: ImpactStampProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const sc = spring({ frame: f, fps, config: { stiffness: 300, damping: 18, mass: 0.8 } });
  // Overshoot: 0 → 1.5 → 1.0 via spring
  const scaleVal = interpolate(sc, [0, 1], [0, 1]);
  const letterOp = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  // Flash white → blue over first 12 frames
  const flashT = interpolate(f, [0, 12], [1, 0], { extrapolateRight: "clamp" });
  const letterColor = flashT > 0 ? `rgb(${Math.round(255 * flashT + parseInt(color.slice(1,3),16) * (1-flashT))},${Math.round(255 * flashT + parseInt(color.slice(3,5),16) * (1-flashT))},${Math.round(255 * flashT + parseInt(color.slice(5,7),16) * (1-flashT))})` : color;

  // Shockwave ring
  const ringProgress = interpolate(f, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const ringOp = interpolate(f, [0, 8, 25], [0.8, 0.6, 0], { extrapolateRight: "clamp" });
  const ringR = ringProgress * fontSize * 0.9;

  // 6 spark particles burst outward
  const sparks = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const dist = interpolate(f, [0, 20], [0, fontSize * 0.8], { extrapolateRight: "clamp" });
    const sOp = interpolate(f, [0, 8, 22], [0, 1, 0], { extrapolateRight: "clamp" });
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, op: sOp };
  });

  if (f < 0) return null;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Shockwave ring */}
      <svg
        style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}
        width={fontSize * 3}
        height={fontSize * 3}
        viewBox={`${-fontSize * 1.5} ${-fontSize * 1.5} ${fontSize * 3} ${fontSize * 3}`}
      >
        <circle cx={0} cy={0} r={ringR} fill="none"
          stroke={glowColor} strokeWidth={3}
          opacity={ringOp}
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
        />
        {/* Spark particles */}
        {sparks.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={3}
            fill={i % 2 === 0 ? glowColor : "#E8A835"}
            opacity={s.op}
            style={{ filter: `drop-shadow(0 0 4px ${i % 2 === 0 ? glowColor : "#E8A835"})` }}
          />
        ))}
      </svg>

      {/* Letter */}
      <div style={{
        fontSize,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 900,
        color: letterColor,
        transform: `scale(${scaleVal})`,
        opacity: letterOp,
        display: "inline-block",
        textShadow: `0 0 30px ${glowColor}, 0 0 60px rgba(0,153,255,0.3)`,
        transformOrigin: "center bottom",
        position: "relative", zIndex: 1,
      }}>
        {letter}
      </div>
    </div>
  );
}
