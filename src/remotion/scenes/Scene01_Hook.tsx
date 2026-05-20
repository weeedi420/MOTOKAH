import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING, appleReveal, cameraZoom } from "../design";

const HEADLINE = ["Buying", "a", "car", "in", "East", "Africa...", "just", "got", "easier."];

export function Scene01_Hook() {
  const frame = useCurrentFrame();

  // Camera zoom: start slightly zoomed in, pull out slowly
  const zoom = cameraZoom(frame, 0, 90);

  // Fast-cut energy: caption slams in with punch spring
  const captionStart = 2;
  const captionSpring = spring({
    frame: Math.max(0, frame - captionStart),
    fps: 30,
    config: SPRING.punch,
  });

  // Headline words: staggered blur-to-sharp reveal
  const wordStart = 8;
  const words = HEADLINE.map((word, i) => {
    const delay = wordStart + i * 3;
    const t = Math.max(0, Math.min(1, (frame - delay) / 12));
    const s = spring({ frame: t * 30, fps: 30, config: SPRING.snap });

    return {
      word,
      opacity: s,
      transform: `translate3d(0, ${(1 - s) * 25}px, 0)`,
    };
  });

  // Underline draws with spring
  const lineStart = 38;
  const lineSpring = spring({
    frame: Math.max(0, frame - lineStart),
    fps: 30,
    config: SPRING.main,
  });

  // Slight camera shake on impact (first few frames of headline)
  const shake = frame > 8 && frame < 14
    ? Math.sin(frame * 2) * (14 - frame) * 0.3
    : 0;

  // Fade out
  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 245) / 12);

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
        transform: `scale(${zoom}) translateX(${shake}px)`,
      }}
    >
      {/* Caption with punch */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
          color: COLOR.brand,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 32,
          opacity: captionSpring,
          transform: `translate3d(0, ${(1 - captionSpring) * 15}px, 0)`,
        }}
      >
        East Africa
      </div>

      {/* Headline */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0 16px",
          maxWidth: "75%",
          marginBottom: 40,
        }}
      >
        {words.map((w, i) => {
          const isLast = i === HEADLINE.length - 1;
          return (
            <span
              key={i}
              style={{
                fontSize: 78,
                fontWeight: 800,
                lineHeight: 1.05,
                fontFamily: "Inter, system-ui, sans-serif",
                letterSpacing: "-0.03em",
                color: isLast ? COLOR.brand : COLOR.ink,
                opacity: w.opacity,
                transform: w.transform,
                display: "inline-block",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>

      {/* Animated underline */}
      <div
        style={{
          width: 140 * lineSpring,
          height: 3,
          background: `linear-gradient(90deg, ${COLOR.brand}, ${COLOR.accent})`,
          borderRadius: 99,
          boxShadow: `0 0 20px ${COLOR.brandGlow}`,
          opacity: lineSpring,
        }}
      />
    </div>
  );
}
