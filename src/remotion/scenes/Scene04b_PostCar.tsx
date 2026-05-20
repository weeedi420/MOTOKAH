import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";
import { PhoneFrame } from "../components/PhoneFrame";

export function Scene04b_PostCar() {
  const frame = useCurrentFrame();

  // Title snaps in quickly
  const titleSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.snap,
  });

  // Phone slides in
  const phoneSpring = spring({
    frame: Math.max(0, frame - 6),
    fps: 30,
    config: SPRING.cinematic,
  });

  // Fields appear FAST - snappy like SaaS videos
  const fields = [
    { label: "Toyota Hilux 2021", delay: 8 },
    { label: "TSh 78,500,000", delay: 14 },
    { label: "Dar es Salaam", delay: 20 },
    { label: "45,000 km", delay: 26 },
  ].map((f) => {
    const t = Math.max(0, Math.min(1, (frame - f.delay) / 8));
    const s = spring({ frame: t * 30, fps: 30, config: SPRING.snap });
    return { ...f, opacity: s, transform: `translate3d(0, ${(1 - s) * 15}px, 0)` };
  });

  // Button pops in early
  const btnSpring = spring({
    frame: Math.max(0, frame - 34),
    fps: 30,
    config: SPRING.punch,
  });

  // Fade out
  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 50) / 10);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
        padding: "0 80px",
        opacity: fadeOut,
      }}
    >
      {/* Left text */}
      <div style={{ flex: 1, maxWidth: 440 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: COLOR.brand,
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 20,
            opacity: titleSpring,
            transform: `translate3d(0, ${(1 - titleSpring) * 15}px, 0)`,
          }}
        >
          Easy Listing
        </div>

        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: COLOR.ink,
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 20,
            opacity: titleSpring,
            transform: `translate3d(0, ${(1 - titleSpring) * 20}px, 0)`,
          }}
        >
          Post your car
          <br />
          <span style={{ color: COLOR.brand }}>in just 2 minutes</span>
        </div>

        <div
          style={{
            fontSize: 17,
            color: COLOR.inkSoft,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.5,
            opacity: titleSpring,
            transform: `translate3d(0, ${(1 - titleSpring) * 10}px, 0)`,
          }}
        >
          Add photos, set your price, reach thousands of buyers. Free forever.
        </div>
      </div>

      {/* Right: Phone mockup with form */}
      <div
        style={{
          width: 260,
          height: 520,
          background: COLOR.surface,
          borderRadius: 32,
          border: `1px solid ${COLOR.border}`,
          padding: 20,
          opacity: phoneSpring,
          transform: `translate3d(${(1 - phoneSpring) * 40}px, 0, 0) rotate(${(1 - phoneSpring) * 5}deg)`,
          boxShadow: "0 25px 50px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: COLOR.ink,
            fontFamily: "Inter",
            marginBottom: 16,
          }}
        >
          Sell Your Car
        </div>

        <div
          style={{
            height: 90,
            background: COLOR.brandSoft,
            borderRadius: 14,
            border: `2px dashed ${COLOR.brand}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
            fontSize: 12,
            color: COLOR.brand,
            fontWeight: 600,
          }}
        >
          Add Photos
        </div>

        {fields.map((f, i) => (
          <div
            key={i}
            style={{
              background: COLOR.bg,
              borderRadius: 10,
              border: `1px solid ${COLOR.border}`,
              padding: "10px 12px",
              marginBottom: 8,
              fontSize: 12,
              color: COLOR.ink,
              fontFamily: "Inter",
              fontWeight: 500,
              opacity: f.opacity,
              transform: f.transform,
            }}
          >
            {f.label}
          </div>
        ))}

        <div
          style={{
            background: COLOR.brand,
            color: "#fff",
            borderRadius: 12,
            padding: "12px",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 800,
            fontFamily: "Inter",
            marginTop: 6,
            opacity: btnSpring,
            transform: `scale(${0.9 + btnSpring * 0.1})`,
            boxShadow: `0 0 20px ${COLOR.brandGlow}`,
          }}
        >
          Post Listing →
        </div>
      </div>
    </div>
  );
}
