import { interpolate, useCurrentFrame } from "remotion";

export function Scene10_Outro() {
  const frame = useCurrentFrame();

  // Logo fades out over first 80 frames, then pure black
  const logoOp = interpolate(frame, [0, 70], [1, 0], { extrapolateRight: "clamp" });
  const underlineOp = interpolate(frame, [0, 50], [1, 0], { extrapolateRight: "clamp" });

  // Single particle drifts upward and fades
  const particleY = interpolate(frame, [10, 120], [60, -40], { extrapolateRight: "clamp" });
  const particleOp = interpolate(frame, [10, 40, 100, 120], [0, 0.8, 0.4, 0], { extrapolateRight: "clamp" });

  // Background: fade in from last scene's color to pure black
  const bgBlack = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: `rgba(0,0,0,${bgBlack})`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* MOTOKAH fading logo */}
      <div style={{ opacity: logoOp, textAlign: "center" }}>
        <div style={{
          fontSize: 52, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 900,
          background: "linear-gradient(135deg, #0099FF 0%, #00D4FF 50%, #0066cc 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          letterSpacing: 4,
          filter: "drop-shadow(0 0 16px rgba(0,153,255,0.5))",
        }}>
          MOTOKAH
        </div>
        {/* Underline */}
        <div style={{
          width: "70%", height: 2, margin: "6px auto 0",
          background: "linear-gradient(to right, transparent, #E8A835, transparent)",
          opacity: underlineOp,
        }} />
      </div>

      {/* Single drifting particle */}
      <div style={{
        position: "absolute",
        left: "50%", top: `${particleY}%`,
        width: 6, height: 6, borderRadius: "50%",
        background: "#0099FF",
        opacity: particleOp,
        transform: "translateX(-50%)",
        boxShadow: "0 0 12px #0099FF, 0 0 24px rgba(0,153,255,0.4)",
      }} />
    </div>
  );
}
