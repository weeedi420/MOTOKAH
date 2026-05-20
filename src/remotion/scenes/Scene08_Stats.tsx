import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";

export function Scene08_Stats() {
  const frame = useCurrentFrame();

  const titleSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.main,
  });

  const stats = [
    { value: "10K+", label: "Listings", delay: 10 },
    { value: "6", label: "Countries", delay: 18 },
    { value: "Free", label: "Forever", delay: 26 },
  ].map((stat) => {
    const t = Math.max(0, Math.min(1, (frame - stat.delay) / 20));
    const s = spring({ frame: t * 30, fps: 30, config: SPRING.elastic });

    return {
      ...stat,
      opacity: s,
      transform: `translate3d(0, ${(1 - s) * 50}px, 0) scale(${0.8 + s * 0.2})`,
    };
  });

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 1675) / 12);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
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
        }}
      >
        By The Numbers
      </div>

      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: COLOR.ink,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.03em",
          textAlign: "center",
          marginBottom: 64,
          lineHeight: 1.1,
          opacity: titleSpring,
          transform: `translate3d(0, ${(1 - titleSpring) * 20}px, 0)`,
        }}
      >
        Over ten thousand listings.
        <br />
        <span style={{ color: COLOR.brand }}>Completely free.</span>
      </div>

      <div style={{ display: "flex", gap: 48 }}>
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              opacity: s.opacity,
              transform: s.transform,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: COLOR.brand,
                fontFamily: "Inter",
                lineHeight: 1,
                textShadow: `0 0 40px ${COLOR.brandGlow}`,
                marginBottom: 8,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: COLOR.inkSoft,
                fontFamily: "Inter",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
