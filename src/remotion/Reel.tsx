import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { MotokahPromo } from "./Main";

// Vertical 1080x1920 Instagram Reel — wraps the full MotokahPromo (how-it-works
// montage of all scenes) inside a branded blue frame with header + CTA.
export function MotokahReel() {
  const frame = useCurrentFrame();
  const headIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const ctaPulse = 1 + Math.sin(frame / 14) * 0.015;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg,#0a78e0 0%,#0057b8 55%,#004a9e 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* soft decorative circles */}
      <div style={{ position: "absolute", width: 620, height: 620, top: -180, right: -160, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
      <div style={{ position: "absolute", width: 460, height: 460, bottom: -150, left: -130, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />

      {/* header */}
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, textAlign: "center", color: "#fff", opacity: headIn, transform: `translateY(${(1 - headIn) * -20}px)` }}>
        <div style={{ fontSize: 68, fontWeight: 900, letterSpacing: -1 }}>
          Motokah<span style={{ color: "#f5a623" }}>.</span>
        </div>
        <div style={{ fontSize: 26, letterSpacing: 9, opacity: 0.82, marginTop: 8 }}>HOW IT WORKS</div>
      </div>

      {/* the promo (all scenes) inside a phone-like screen */}
      <div
        style={{
          position: "absolute",
          top: 430,
          left: 60,
          width: 960,
          height: 540,
          borderRadius: 36,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,.4)",
          border: "6px solid rgba(255,255,255,.9)",
        }}
      >
        <div style={{ width: 1280, height: 720, transform: "scale(0.75)", transformOrigin: "top left" }}>
          <MotokahPromo />
        </div>
      </div>

      {/* steps strip */}
      <div style={{ position: "absolute", top: 1040, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 28, color: "#fff" }}>
        {["Search", "Chat", "Drive"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ fontSize: 40, fontWeight: 800 }}>
              <span style={{ color: "#f5a623", fontWeight: 900 }}>{i + 1}</span>&nbsp;{s}
            </div>
            {i < 2 && <div style={{ fontSize: 36, opacity: 0.6 }}>→</div>}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, transform: `scale(${ctaPulse})` }}>
          List your car FREE<br />in 2 minutes
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, marginTop: 26, opacity: 0.92 }}>@motokahafrica</div>
      </div>
    </AbsoluteFill>
  );
}
