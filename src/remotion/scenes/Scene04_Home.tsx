import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING, cameraZoom } from "../design";

const FEATURES = [
  { icon: "✓", title: "Verified Listings", desc: "Every car is checked" },
  { icon: "✓", title: "Real Prices", desc: "No hidden fees" },
  { icon: "✓", title: "5 Countries", desc: "East Africa covered" },
];

export function Scene04_Home() {
  const frame = useCurrentFrame();

  const zoom = cameraZoom(frame, 0, 90);

  const titleSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.main,
  });

  const features = FEATURES.map((f, i) => {
    const delay = 15 + i * 12;
    const t = Math.max(0, Math.min(1, (frame - delay) / 18));
    const s = spring({ frame: t * 30, fps: 30, config: SPRING.elastic });

    return {
      ...f,
      opacity: s,
      transform: `translate3d(0, ${(1 - s) * 40}px, 0) scale(${0.9 + s * 0.1})`,
      filter: `blur(${(1 - s) * 8}px)`,
    };
  });

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 90) / 15);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        opacity: fadeOut,
        transform: `scale(${zoom})`,
      }}
    >
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
        Why Motokah
      </div>

      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: COLOR.ink,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.03em",
          textAlign: "center",
          marginBottom: 56,
          lineHeight: 1.1,
          opacity: titleSpring,
          transform: `translate3d(0, ${(1 - titleSpring) * 20}px, 0)`,
          filter: `blur(${(1 - titleSpring) * 6}px)`,
        }}
      >
        Verified listings.
        <br />
        <span style={{ color: COLOR.brand }}>Real prices.</span>
      </div>

      <div style={{ display: "flex", gap: 32 }}>
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              background: "rgba(245,166,35,0.06)",
              borderRadius: 20,
              padding: "32px 36px",
              border: `1px solid ${COLOR.brandSoft}`,
              minWidth: 220,
              textAlign: "center",
              opacity: f.opacity,
              transform: f.transform,
              filter: f.filter,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: COLOR.brand,
                marginBottom: 12,
                textShadow: `0 0 20px ${COLOR.brandGlow}`,
              }}
            >
              {f.icon}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: COLOR.ink,
                fontFamily: "Inter",
                marginBottom: 8,
              }}
            >
              {f.title}
            </div>
            <div
              style={{
                fontSize: 14,
                color: COLOR.inkSoft,
                fontFamily: "Inter",
              }}
            >
              {f.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
