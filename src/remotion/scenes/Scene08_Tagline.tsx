import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const WORDS = [
  { word: "Buy.", color: "#F0F4FF", delay: 0 },
  { word: "Sell.", color: "#0099FF", delay: 22 },
  { word: "Discover.", color: "#E8A835", delay: 44 },
];

export function Scene08_Tagline() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [220, 240], [1, 0], { extrapolateRight: "clamp" });

  // Per-word color burst particles
  const wordBursts = WORDS.map((w, wi) => {
    return Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const f = frame - w.delay;
      const dist = interpolate(f, [0, 30], [0, 80 + i * 8], { extrapolateRight: "clamp" });
      const op = interpolate(f, [0, 10, 32], [0, 0.9, 0], { extrapolateRight: "clamp" });
      return { x: Math.cos(a) * dist, y: Math.sin(a) * dist, op, color: w.color };
    });
  });

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 50%, #0a1525 0%, #020508 80%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: bgOp * fadeOut,
    }}>
      {/* Sub-header */}
      <div style={{
        color: "rgba(232,168,53,0.7)", fontSize: 10, letterSpacing: 6,
        fontFamily: "Inter, sans-serif", fontWeight: 700, marginBottom: 30,
        opacity: interpolate(frame, [5, 28], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        MOTOKAH · THE MARKETPLACE
      </div>

      {/* Animated words with impact stamps */}
      <div style={{ display: "flex", gap: 18, marginBottom: 32, position: "relative" }}>
        {WORDS.map((w, i) => {
          const sc = spring({ frame: frame - w.delay, fps, config: { stiffness: 280, damping: 15, mass: 0.7 } });
          const op = interpolate(frame - w.delay, [0, 8], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ position: "relative" }}>
              {/* Color burst */}
              <div style={{ position: "absolute", left: "50%", top: "50%" }}>
                {wordBursts[i].map((p, j) => (
                  <div key={j} style={{
                    position: "absolute",
                    left: p.x, top: p.y,
                    width: 5, height: 5, borderRadius: "50%",
                    background: p.color,
                    opacity: p.op,
                    transform: "translate(-50%,-50%)",
                    boxShadow: `0 0 6px ${p.color}`,
                  }} />
                ))}
              </div>
              <div style={{
                fontSize: 64, fontFamily: "Inter, sans-serif", fontWeight: 900,
                color: w.color,
                transform: `scale(${sc})`, opacity: op,
                textShadow: `0 0 35px ${w.color}66`,
                position: "relative", zIndex: 1,
              }}>
                {w.word}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main tagline */}
      <div style={{
        color: "#c0d8f0", fontSize: 18, fontFamily: "Inter, sans-serif",
        fontWeight: 500, letterSpacing: 2, textAlign: "center",
        opacity: interpolate(frame, [70, 95], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        East Africa's #1 Vehicle Marketplace
      </div>

      {/* Feature strip */}
      <div style={{
        display: "flex", gap: 28, marginTop: 36,
        opacity: interpolate(frame, [92, 118], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        {["🚗  All Vehicle Types", "📱  WhatsApp Integration", "🆓  Free to List & Browse"].map((item, i) => (
          <div key={i} style={{
            color: "#5070a0", fontSize: 11, fontFamily: "Inter, sans-serif",
            fontWeight: 600, textAlign: "center",
          }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
