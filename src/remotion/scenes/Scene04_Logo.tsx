import { interpolate, useCurrentFrame } from "remotion";
import { ImpactStamp } from "../components/ImpactStamp";

const LETTERS = ["M", "O", "T", "O", "K", "A", "H"];
const LETTER_DELAY = 18; // frames between each letter

export function Scene04_Logo() {
  const frame = useCurrentFrame();

  const bgOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [220, 240], [1, 0], { extrapolateRight: "clamp" });

  // Gold underline draws after all letters are in
  const lastLetterFrame = LETTERS.length * LETTER_DELAY;
  const underlineW = interpolate(frame, [lastLetterFrame + 10, lastLetterFrame + 55], [0, 100], { extrapolateRight: "clamp" });
  const underlineOp = interpolate(frame, [lastLetterFrame + 8, lastLetterFrame + 20], [0, 1], { extrapolateRight: "clamp" });

  // Tagline
  const tagOp = interpolate(frame, [lastLetterFrame + 45, lastLetterFrame + 75], [0, 1], { extrapolateRight: "clamp" });

  // Whole-word shockwave ring after last letter
  const finalRingR = interpolate(frame, [lastLetterFrame, lastLetterFrame + 60], [0, 350], { extrapolateRight: "clamp" });
  const finalRingOp = interpolate(frame, [lastLetterFrame, lastLetterFrame + 20, lastLetterFrame + 65], [0, 0.7, 0], { extrapolateRight: "clamp" });

  // Background glow pulse
  const glowPulse = 1 + 0.06 * Math.sin((frame / 30) * Math.PI * 2);

  // Radial burst particles from center (frame 100-160)
  const burst = Array.from({ length: 24 }, (_, i) => {
    const bAngle = (i / 24) * Math.PI * 2;
    const bF = frame - lastLetterFrame;
    const bDist = interpolate(bF, [0, 55], [0, 200 + (i % 4) * 30], { extrapolateRight: "clamp" });
    const bOp = interpolate(bF, [0, 15, 55], [0, 1, 0], { extrapolateRight: "clamp" });
    return { x: Math.cos(bAngle) * bDist, y: Math.sin(bAngle) * bDist, op: bOp };
  });

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "#030508",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: bgOp * fadeOut,
    }}>
      {/* Background glow halo */}
      <div style={{
        position: "absolute",
        width: 600 * glowPulse, height: 280 * glowPulse,
        background: "radial-gradient(ellipse, rgba(0,153,255,0.18) 0%, transparent 70%)",
        transform: `scale(${glowPulse})`,
        filter: "blur(24px)",
      }} />

      {/* Burst particles */}
      <div style={{ position: "absolute", left: "50%", top: "46%" }}>
        {burst.map((p, i) => (
          <div key={i} style={{
            position: "absolute",
            left: p.x, top: p.y,
            width: 5, height: 5, borderRadius: "50%",
            background: i % 2 === 0 ? "#E8A835" : "#0099FF",
            opacity: p.op,
            transform: "translate(-50%,-50%)",
            boxShadow: `0 0 8px ${i % 2 === 0 ? "#E8A835" : "#0099FF"}`,
          }} />
        ))}
      </div>

      {/* Whole-word shockwave */}
      <svg style={{ position: "absolute", left: "50%", top: "46%", transform: "translate(-50%,-50%)" }}
        width={800} height={400} viewBox="-400 -200 800 400">
        <circle cx={0} cy={0} r={finalRingR}
          fill="none" stroke="#0099FF" strokeWidth={3}
          opacity={finalRingOp}
          style={{ filter: "drop-shadow(0 0 12px #0099FF)" }}
        />
      </svg>

      {/* MOTOKAH letters with ImpactStamp */}
      <div style={{ display: "flex", gap: 0, position: "relative", zIndex: 2, alignItems: "baseline" }}>
        {LETTERS.map((letter, i) => (
          <ImpactStamp
            key={i}
            letter={letter}
            delay={i * LETTER_DELAY}
            fontSize={82}
            color="#0099FF"
            glowColor="#0099FF"
          />
        ))}
      </div>

      {/* Gold underline */}
      <div style={{
        width: "56%", height: 4, marginTop: 4, overflow: "hidden",
        opacity: underlineOp, position: "relative", zIndex: 2,
      }}>
        <div style={{
          height: "100%", width: `${underlineW}%`,
          background: "linear-gradient(to right, #E8A835, #ffdd66, #E8A835)",
          boxShadow: "0 0 16px #E8A835",
          borderRadius: 2,
          transition: "none",
        }} />
      </div>

      {/* Tagline */}
      <div style={{
        marginTop: 22, color: "#a0c0e0", fontSize: 15,
        fontFamily: "Inter, sans-serif", letterSpacing: 6, fontWeight: 500,
        opacity: tagOp, position: "relative", zIndex: 2,
        textShadow: "0 0 20px rgba(160,192,224,0.3)",
      }}>
        FIND YOUR PERFECT RIDE
      </div>
    </div>
  );
}
