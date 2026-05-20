import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CountUp } from "../components/CountUp";

const STATS = [
  { label: "Active Listings", value: 10000, suffix: "+", icon: "🚗", delay: 0 },
  { label: "Countries", value: 7, suffix: "", icon: "🌍", delay: 25 },
  { label: "Free to List", value: 100, suffix: "% Free", icon: "✅", delay: 50 },
];

export function Scene05_Stats() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [215, 240], [1, 0], { extrapolateRight: "clamp" });

  const headerOp = interpolate(frame, [0, 28], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(160deg, #040c18 0%, #050810 50%, #03060e 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: bgOp * fadeOut,
    }}>
      {/* Grid scanline texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,153,255,0.02) 0px, transparent 1px, transparent 40px, rgba(0,153,255,0.02) 40px)",
        pointerEvents: "none",
      }} />

      <div style={{
        color: "rgba(0,153,255,0.65)", fontSize: 10, letterSpacing: 7,
        fontFamily: "Inter, sans-serif", fontWeight: 700, marginBottom: 36,
        opacity: headerOp,
      }}>
        BY THE NUMBERS
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        {STATS.map((stat, i) => {
          const sc = spring({ frame: frame - stat.delay, fps, config: { stiffness: 140, damping: 13 } });
          const cardOp = interpolate(frame - stat.delay, [0, 18], [0, 1], { extrapolateRight: "clamp" });
          const glowPulse = 1 + 0.1 * Math.sin((frame / 30) * Math.PI * 2 + i * 1.2);

          return (
            <div key={i} style={{
              width: 172, padding: "28px 22px",
              borderRadius: 18,
              background: "rgba(0,153,255,0.04)",
              border: "1px solid rgba(0,153,255,0.18)",
              textAlign: "center",
              transform: `scale(${sc})`,
              opacity: cardOp,
              boxShadow: `0 0 ${36 * glowPulse}px rgba(0,153,255,0.09), inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 0 rgba(0,153,255,0.15)`,
              backdropFilter: "blur(4px)",
            }}>
              <div style={{ fontSize: 34, marginBottom: 12 }}>{stat.icon}</div>
              <div style={{
                fontSize: 40, fontFamily: "Inter, sans-serif", fontWeight: 900,
                color: "#0099FF",
                textShadow: "0 0 24px rgba(0,153,255,0.7)",
                lineHeight: 1,
              }}>
                <CountUp to={stat.value} suffix={stat.suffix} startFrame={stat.delay + 12} duration={60} />
              </div>
              <div style={{
                color: "#6080a0", fontSize: 11, fontFamily: "Inter, sans-serif",
                fontWeight: 600, letterSpacing: 1, marginTop: 10,
              }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom tagline */}
      <div style={{
        marginTop: 38, color: "#E8A835", fontSize: 14, fontFamily: "Inter, sans-serif",
        fontWeight: 700, letterSpacing: 2,
        opacity: interpolate(frame, [90, 115], [0, 1], { extrapolateRight: "clamp" }),
        textShadow: "0 0 14px rgba(232,168,53,0.4)",
      }}>
        East Africa's #1 Vehicle Marketplace
      </div>
    </div>
  );
}
