import { interpolate, useCurrentFrame } from "remotion";
import { ParticleField } from "../components/ParticleField";

const AFRICA_PATH =
  "M 155 28 L 185 18 L 215 22 L 248 30 L 272 48 L 290 72 L 302 98 L 308 120 " +
  "L 320 142 L 340 158 L 348 178 L 342 200 L 332 222 L 324 250 L 318 278 " +
  "L 310 305 L 298 332 L 282 358 L 265 380 L 248 400 L 232 415 L 215 422 " +
  "L 200 422 L 185 415 L 170 400 L 155 378 L 140 352 L 128 322 L 120 292 " +
  "L 115 262 L 112 232 L 108 205 L 102 180 L 95 158 L 88 138 L 82 118 " +
  "L 80 96 L 88 74 L 100 56 L 120 40 L 140 30 Z";

const PATH_LEN = 1800;

// 80 stars with fixed random positions (seeded deterministically)
const STARS = Array.from({ length: 80 }, (_, i) => {
  const seed = (i * 9301 + 49297) % 233280;
  return {
    x: ((seed * 1.1) % 100),
    y: ((seed * 0.7) % 100),
    size: 0.8 + (i % 3) * 0.7,
    delay: (i % 40) * 2,
    twinkle: (i % 5) * 0.4,
  };
});

export function Scene01_ColdOpen() {
  const frame = useCurrentFrame();

  const bgOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Stars fade in staggered
  const africaStroke = interpolate(frame, [30, 110], [PATH_LEN, 0], { extrapolateRight: "clamp" });
  const africaOp = interpolate(frame, [28, 45], [0, 1], { extrapolateRight: "clamp" });
  const africaGlow = interpolate(frame, [90, 140], [0, 0.7], { extrapolateRight: "clamp" });

  // "EAST AFRICA" label
  const labelOp = interpolate(frame, [80, 110], [0, 1], { extrapolateRight: "clamp" });
  const labelY = interpolate(frame, [80, 110], [12, 0], { extrapolateRight: "clamp" });

  // Tagline "One Platform. All Cars."
  const tagOp = interpolate(frame, [105, 135], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [105, 135], [10, 0], { extrapolateRight: "clamp" });

  // Fade out
  const fadeOut = interpolate(frame, [145, 170], [1, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 55% 40%, #061020 0%, #020508 75%)",
      opacity: bgOp * fadeOut,
    }}>
      <ParticleField startFrame={0} />

      {/* Stars */}
      {STARS.map((s, i) => {
        const starOp = interpolate(frame, [s.delay, s.delay + 20], [0, 1], { extrapolateRight: "clamp" });
        const twinkle = 0.5 + 0.5 * Math.sin((frame / 40 + s.twinkle) * Math.PI * 2);
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            borderRadius: "50%",
            background: "#ffffff",
            opacity: starOp * (0.3 + 0.7 * twinkle),
          }} />
        );
      })}

      {/* Africa SVG */}
      <div style={{
        position: "absolute", right: "6%", top: "50%",
        transform: "translateY(-50%)",
        opacity: africaOp,
      }}>
        <svg viewBox="0 0 400 480" width={200} height={240} style={{ overflow: "visible" }}>
          <defs>
            <filter id="afGlow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Glow halo */}
          <path d={AFRICA_PATH} fill="none" stroke="#0099FF" strokeWidth={10}
            opacity={africaGlow} style={{ filter: "blur(10px)" }} />
          {/* Main stroke draw */}
          <path d={AFRICA_PATH}
            fill="rgba(0,153,255,0.05)"
            stroke="#0099FF" strokeWidth={2.5}
            strokeDasharray={PATH_LEN} strokeDashoffset={africaStroke}
            strokeLinecap="round" strokeLinejoin="round"
            filter="url(#afGlow)"
          />
          {/* Country dots */}
          {[
            { cx: 258, cy: 310 }, { cx: 278, cy: 285 }, { cx: 242, cy: 278 },
            { cx: 295, cy: 245 }, { cx: 138, cy: 238 }, { cx: 235, cy: 292 }, { cx: 238, cy: 300 },
          ].map((p, i) => {
            const dotOp = interpolate(frame, [95 + i * 6, 110 + i * 6], [0, 1], { extrapolateRight: "clamp" });
            const pulse = 1 + 0.25 * Math.sin((frame / 30) * Math.PI * 2 + i * 1.1);
            return (
              <g key={i} opacity={dotOp}>
                <circle cx={p.cx} cy={p.cy} r={9 * pulse} fill="rgba(0,153,255,0.15)" />
                <circle cx={p.cx} cy={p.cy} r={4} fill="#0099FF"
                  style={{ filter: "drop-shadow(0 0 5px #0099FF)" }} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Left text */}
      <div style={{
        position: "absolute", left: "7%", top: "50%", transform: "translateY(-50%)",
      }}>
        <div style={{
          color: "rgba(0,153,255,0.6)", fontSize: 11, letterSpacing: 7,
          fontFamily: "Inter, sans-serif", fontWeight: 700, marginBottom: 14,
          opacity: labelOp, transform: `translateY(${labelY}px)`,
        }}>
          EAST AFRICA
        </div>
        <div style={{
          color: "#F0F4FF", fontSize: 40, fontFamily: "Inter, sans-serif",
          fontWeight: 900, lineHeight: 1.1, marginBottom: 12,
          opacity: tagOp, transform: `translateY(${tagY}px)`,
        }}>
          One Platform.<br />
          <span style={{
            background: "linear-gradient(135deg, #0099FF, #00D4FF)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>All Cars.</span>
        </div>
        <div style={{
          color: "#E8A835", fontSize: 13, fontFamily: "Inter, sans-serif",
          letterSpacing: 2, fontWeight: 600,
          opacity: tagOp,
        }}>
          7 Countries · Free to List &amp; Browse
        </div>
      </div>

      {/* Bottom letterbox bars */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 36,
        background: "linear-gradient(to top, #010408, transparent)",
      }} />
    </div>
  );
}
