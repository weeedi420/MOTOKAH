import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";

const PROBLEMS = [
  "No more WhatsApp groups.",
  "No more random listings.",
  "No more vague prices.",
];

export function Scene02_Problem() {
  const frame = useCurrentFrame();

  // Title reveal
  const titleSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.main,
  });

  // Problem lines: staggered spring reveal
  const problems = PROBLEMS.map((text, i) => {
    const delay = 12 + i * 14;
    const t = Math.max(0, Math.min(1, (frame - delay) / 18));
    const s = spring({ frame: t * 30, fps: 30, config: SPRING.elastic });

    return {
      text,
      opacity: s,
      transform: `translate3d(${(1 - s) * -50}px, 0, 0)`,
    };
  });

  // "There's a better way" reveal
  const betterSpring = spring({
    frame: Math.max(0, frame - 65),
    fps: 30,
    config: SPRING.punch,
  });

  // Fade out
  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 390) / 30);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 120px",
        opacity: fadeOut,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: COLOR.inkMute,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 40,
          opacity: titleSpring,
          transform: `translate3d(0, ${(1 - titleSpring) * 15}px, 0)`,
        }}
      >
        The Problem
      </div>

      {/* Problem lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 48 }}>
        {problems.map((p, i) => (
          <div
            key={i}
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: COLOR.ink,
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              opacity: p.opacity,
              transform: p.transform,
            }}
          >
            {p.text}
          </div>
        ))}
      </div>

      {/* Better way */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: COLOR.brand,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "-0.01em",
          opacity: betterSpring,
          transform: `translate3d(0, ${(1 - betterSpring) * 20}px, 0)`,
          textShadow: `0 0 30px ${COLOR.brandGlow}`,
        }}
      >
        There's a better way.
      </div>
    </div>
  );
}
