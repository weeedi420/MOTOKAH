import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING, cameraZoom } from "../design";

const LETTERS = ["M", "O", "T", "O", "K", "A", "H"];

export function Scene03_Brand() {
  const frame = useCurrentFrame();

  // Camera zoom: dramatic pull out
  const zoom = cameraZoom(frame, 0, 90);

  // Letters spring in with stagger
  const letters = LETTERS.map((letter, i) => {
    const delay = 12 + i * 2;
    const t = Math.max(0, Math.min(1, (frame - delay) / 15));
    const s = spring({ frame: t * 30, fps: 30, config: SPRING.elastic });

    return {
      letter,
      opacity: s,
      transform: `translate3d(0, ${(1 - s) * 60}px, 0) scale(${0.5 + s * 0.5})`,
      filter: `blur(${(1 - s) * 12}px)`,
    };
  });

  // Glow pulse after letters appear
  const glowStart = 30;
  const glowSpring = spring({
    frame: Math.max(0, frame - glowStart),
    fps: 30,
    config: SPRING.float,
  });
  const glowPulse = 0.08 + 0.12 * glowSpring * Math.sin(frame * 0.15);

  // Underline draws
  const lineStart = 32;
  const lineSpring = spring({
    frame: Math.max(0, frame - lineStart),
    fps: 30,
    config: SPRING.main,
  });

  // Tagline fades in
  const tagStart = 45;
  const tagSpring = spring({
    frame: Math.max(0, frame - tagStart),
    fps: 30,
    config: SPRING.cinematic,
  });

  // Fade out
  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 140) / 20);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
        transform: `scale(${zoom})`,
      }}
    >
      {/* Brand name */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          position: "relative",
          gap: 2,
        }}
      >
        {letters.map((l, i) => (
          <span
            key={i}
            style={{
              fontSize: 120,
              fontWeight: 800,
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: "-0.04em",
              color: COLOR.brand,
              opacity: l.opacity,
              transform: l.transform,
              filter: l.filter,
              display: "inline-block",
              textShadow: `0 0 40px ${COLOR.brandGlow}`,
            }}
          >
            {l.letter}
          </span>
        ))}

        {/* Ambient glow behind brand */}
        <div
          style={{
            position: "absolute",
            inset: "-40px -60px",
            background: `radial-gradient(ellipse at center, ${COLOR.brandSoft} ${glowPulse * 100}%, transparent 70%)`,
            opacity: glowSpring,
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      </div>

      {/* Animated underline */}
      <div
        style={{
          width: 500 * lineSpring,
          height: 4,
          background: `linear-gradient(90deg, ${COLOR.brand}, ${COLOR.accent})`,
          borderRadius: 99,
          marginTop: 12,
          boxShadow: `0 0 30px ${COLOR.brandGlow}`,
          opacity: lineSpring,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          marginTop: 32,
          fontSize: 20,
          fontWeight: 500,
          fontFamily: "Inter, sans-serif",
          color: COLOR.inkSoft,
          letterSpacing: "-0.01em",
          opacity: tagSpring,
          transform: `translate3d(0, ${(1 - tagSpring) * 15}px, 0)`,
          filter: `blur(${(1 - tagSpring) * 4}px)`,
        }}
      >
        The marketplace for East Africa's car market.
      </div>
    </div>
  );
}
