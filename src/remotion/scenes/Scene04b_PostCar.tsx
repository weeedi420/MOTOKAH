import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";
import { PhoneFrame } from "../components/PhoneFrame";

export function Scene04b_PostCar() {
  const frame = useCurrentFrame();

  const titleSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.main,
  });

  const phoneSpring = spring({
    frame: Math.max(0, frame - 10),
    fps: 30,
    config: SPRING.cinematic,
  });

  const fields = [
    { label: "Toyota Hilux 2021", delay: 20 },
    { label: "TSh 78,500,000", delay: 32 },
    { label: "Dar es Salaam", delay: 44 },
    { label: "45,000 km", delay: 56 },
  ].map((f) => {
    const t = Math.max(0, Math.min(1, (frame - f.delay) / 14));
    const s = spring({ frame: t * 30, fps: 30, config: SPRING.snap });
    return { ...f, opacity: s, transform: `translate3d(0, ${(1 - s) * 20}px, 0)`, filter: `blur(${(1 - s) * 6}px)` };
  });

  const btnSpring = spring({
    frame: Math.max(0, frame - 72),
    fps: 30,
    config: SPRING.elastic,
  });

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 55) / 15);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 80,
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
            filter: `blur(${(1 - titleSpring) * 4}px)`,
          }}
        >
          Easy Listing
        </div>

        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: COLOR.ink,
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 20,
            opacity: titleSpring,
            transform: `translate3d(0, ${(1 - titleSpring) * 20}px, 0)`,
            filter: `blur(${(1 - titleSpring) * 6}px)`,
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
            filter: `blur(${(1 - titleSpring) * 3}px)`,
          }}
        >
          Add photos, set your price, and reach thousands of buyers across East Africa. Free forever.
        </div>
      </div>

      {/* Right: Phone mockup with form */}
      <div
        style={{
          width: 280,
          height: 560,
          background: COLOR.surface,
          borderRadius: 36,
          border: `1px solid ${COLOR.border}`,
          padding: 24,
          opacity: phoneSpring,
          transform: `translate3d(${(1 - phoneSpring) * 40}px, 0, 0) rotate(${(1 - phoneSpring) * 5}deg)`,
          filter: `blur(${(1 - phoneSpring) * 8}px)`,
          boxShadow: "0 25px 50px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: COLOR.ink,
            fontFamily: "Inter",
            marginBottom: 20,
          }}
        >
          Sell Your Car
        </div>

        <div
          style={{
            height: 100,
            background: COLOR.brandSoft,
            borderRadius: 16,
            border: `2px dashed ${COLOR.brand}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            fontSize: 13,
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
              borderRadius: 12,
              border: `1px solid ${COLOR.border}`,
              padding: "12px 14px",
              marginBottom: 10,
              fontSize: 13,
              color: COLOR.ink,
              fontFamily: "Inter",
              fontWeight: 500,
              opacity: f.opacity,
              transform: f.transform,
              filter: f.filter,
            }}
          >
            {f.label}
          </div>
        ))}

        <div
          style={{
            background: COLOR.brand,
            color: "#fff",
            borderRadius: 14,
            padding: "14px",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 800,
            fontFamily: "Inter",
            marginTop: 8,
            opacity: btnSpring,
            transform: `scale(${0.9 + btnSpring * 0.1})`,
            filter: `blur(${(1 - btnSpring) * 4}px)`,
            boxShadow: `0 0 20px ${COLOR.brandGlow}`,
          }}
        >
          Post Listing →
        </div>
      </div>
    </div>
  );
}
