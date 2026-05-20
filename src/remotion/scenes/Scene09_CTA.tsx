import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, EASE, RADIUS, SHADOW } from "../design";

const DOMAIN = "motokah.com";

export function Scene09_CTA() {
  const frame = useCurrentFrame();

  // Swahili - FASTER
  const swahiliOp = interpolate(frame, [10, 22], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const swahiliY  = interpolate(frame, [10, 22], [8, 0],  { extrapolateRight: "clamp", easing: EASE });

  // Translation - FASTER
  const transOp = interpolate(frame, [20, 30], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const transY  = interpolate(frame, [20, 30], [6, 0],  { extrapolateRight: "clamp", easing: EASE });

  // Domain — chars stagger 1 frame each - FASTER
  const domainCharOps = DOMAIN.split("").map((_, i) =>
    interpolate(frame, [34 + i * 1, 42 + i * 1], [0, 1], { extrapolateRight: "clamp" })
  );

  // CTA button - FASTER
  const btnOp = interpolate(frame, [60, 72], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const btnY  = interpolate(frame, [60, 72], [8, 0],  { extrapolateRight: "clamp", easing: EASE });

  // Button pulse/glow after it appears
  const btnPulse = frame >= 72 ? 1 + 0.03 * Math.sin((frame / 16) * Math.PI * 2) : 1;
  const btnGlow = frame >= 72 ? 0.15 + 0.1 * Math.sin((frame / 16) * Math.PI * 2) : 0;

  // Watermark logo top-left
  const wm = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: COLOR.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Watermark */}
      <div style={{
        position: "absolute", top: 32, left: 40,
        fontSize: 12, fontWeight: 700, color: COLOR.inkMute,
        fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em",
        opacity: wm,
      }}>
        Motokah
      </div>

      {/* Swahili */}
      <div style={{
        fontSize: 44,
        fontWeight: 700,
        fontFamily: "Inter, system-ui, sans-serif",
        color: COLOR.ink,
        letterSpacing: "-0.025em",
        marginBottom: 8,
        opacity: swahiliOp,
        transform: `translateY(${swahiliY}px)`,
      }}>
        Gari yako, bei yako.
      </div>

      {/* Translation */}
      <div style={{
        fontSize: 18,
        fontWeight: 400,
        fontFamily: "Inter, sans-serif",
        color: COLOR.inkSoft,
        marginBottom: 48,
        opacity: transOp,
        transform: `translateY(${transY}px)`,
      }}>
        Your car, your price.
      </div>

      {/* Domain */}
      <div style={{
        display: "flex",
        fontSize: 80,
        fontWeight: 700,
        fontFamily: "Inter, system-ui, sans-serif",
        color: COLOR.brandInk,
        letterSpacing: "-0.04em",
        marginBottom: 52,
        lineHeight: 1,
      }}>
        {DOMAIN.split("").map((char, i) => (
          <span key={i} style={{ opacity: domainCharOps[i] }}>
            {char}
          </span>
        ))}
      </div>

      {/* CTA button with pulse */}
      <div style={{
        opacity: btnOp,
        transform: `translateY(${btnY}px)`,
      }}>
        <div style={{
          position: "relative",
        }}>
          {/* Glow behind button */}
          <div style={{
            position: "absolute",
            inset: "-8px -16px",
            background: `radial-gradient(ellipse at center, rgba(0,153,255,${btnGlow}) 0%, transparent 70%)`,
            borderRadius: RADIUS.lg,
            pointerEvents: "none",
          }} />
          <div style={{
            background: COLOR.brand,
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            padding: "18px 40px",
            borderRadius: RADIUS.lg,
            boxShadow: SHADOW.brand,
            letterSpacing: "-0.01em",
            transform: `scale(${btnPulse})`,
            position: "relative",
          }}>
            List your car — Free →
          </div>
        </div>
      </div>
    </div>
  );
}
