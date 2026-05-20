import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, EASE } from "../design";

const HEADLINE = ["Buying", "a", "car", "in", "East", "Africa", "just", "got", "easier."];

export function Scene01_Hook() {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [80, 90], [1, 0], { extrapolateRight: "clamp" });

  // Pre-headline caption - FASTER
  const captionOp = interpolate(frame, [2, 10], [0, 1], { extrapolateRight: "clamp", easing: EASE });

  // Headline words stagger - FASTER (2 frames per word)
  const wordOps = HEADLINE.map((_, i) => ({
    op: interpolate(frame, [10 + i * 3, 18 + i * 3], [0, 1], { extrapolateRight: "clamp", easing: EASE }),
    y:  interpolate(frame, [10 + i * 3, 18 + i * 3], [8, 0],  { extrapolateRight: "clamp", easing: EASE }),
  }));

  // Underline draws left to right - FASTER
  const lineW = interpolate(frame, [45, 58], [0, 120], { extrapolateRight: "clamp", easing: EASE });
  const lineOp = interpolate(frame, [42, 48], [0, 1], { extrapolateRight: "clamp", easing: EASE });

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: COLOR.bg,
      display: "flex", flexDirection: "column",
      justifyContent: "center",
      padding: "0 120px",
      opacity: fadeOut,
    }}>
      {/* Caption */}
      <div style={{
        fontSize: 11,
        fontWeight: 500,
        fontFamily: "Inter, sans-serif",
        color: COLOR.brand,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: 28,
        opacity: captionOp,
      }}>
        East Africa
      </div>

      {/* Headline */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "0 14px",
        maxWidth: "70%",
        marginBottom: 36,
      }}>
        {HEADLINE.map((word, i) => {
          const isLast = i === HEADLINE.length - 1;
          return (
            <span
              key={i}
              style={{
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.05,
                fontFamily: "Inter, system-ui, sans-serif",
                letterSpacing: "-0.03em",
                color: isLast ? COLOR.brand : COLOR.ink,
                opacity: wordOps[i].op,
                transform: `translateY(${wordOps[i].y}px)`,
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Underline */}
      <div style={{
        width: lineW,
        height: 2,
        background: COLOR.brand,
        opacity: lineOp,
        borderRadius: 99,
      }} />
    </div>
  );
}
