import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, EASE } from "../design";

const LETTERS = ["M", "O", "T", "O", "K", "A", "H"];

export function Scene03_Brand() {
  const frame = useCurrentFrame();

  // Previous scene clears by frame 12
  const fadeOut = interpolate(frame, [100, 110], [1, 0], { extrapolateRight: "clamp" });

  // Letters fade in, stagger 2 frames, starting at frame 10
  const letterOps = LETTERS.map((_, i) =>
    interpolate(frame, [10 + i * 2, 18 + i * 2], [0, 1], { extrapolateRight: "clamp", easing: EASE })
  );

  // Underline draws - FASTER
  const lineW = interpolate(frame, [30, 42], [0, 470], { extrapolateRight: "clamp", easing: EASE });
  const lineOp = interpolate(frame, [28, 34], [0, 1], { extrapolateRight: "clamp" });

  // Tagline fades in - FASTER
  const tagOp = interpolate(frame, [48, 58], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const tagY  = interpolate(frame, [48, 58], [8, 0],  { extrapolateRight: "clamp", easing: EASE });

  // Glow pulse after letters appear
  const glowPulse = 0.12 + 0.08 * Math.sin((frame / 20) * Math.PI * 2);

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: COLOR.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: fadeOut,
    }}>
      {/* Wordmark */}
      <div style={{ display: "flex", alignItems: "baseline", position: "relative" }}>
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            style={{
              fontSize: 110,
              fontWeight: 700,
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: "-0.03em",
              color: COLOR.ink,
              opacity: letterOps[i],
              lineHeight: 1,
            }}
          >
            {letter}
          </span>
        ))}

        {/* Glow effect behind wordmark */}
        <div style={{
          position: "absolute",
          inset: "-20px -40px",
          background: `radial-gradient(ellipse at center, ${COLOR.brandSoft} ${glowPulse * 100}%, transparent 70%)`,
          opacity: frame > 50 ? 1 : 0,
          pointerEvents: "none",
          zIndex: -1,
          transition: "opacity 0.3s",
        }} />
      </div>

      {/* Brand underline */}
      <div style={{
        width: lineW,
        height: 3,
        background: COLOR.brand,
        opacity: lineOp,
        borderRadius: 99,
        marginTop: 8,
        alignSelf: "center",
      }} />

      {/* Tagline */}
      <div style={{
        marginTop: 28,
        fontSize: 18,
        fontWeight: 500,
        fontFamily: "Inter, sans-serif",
        color: COLOR.inkSoft,
        letterSpacing: "-0.01em",
        opacity: tagOp,
        transform: `translateY(${tagY}px)`,
      }}>
        The marketplace for East Africa's car market.
      </div>
    </div>
  );
}
