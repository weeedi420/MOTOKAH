import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";

// Only the 6 biggest East African countries - clean and impactful
const COUNTRIES = [
  { name: "Tanzania", city: "Dar es Salaam", delay: 12, num: 1 },
  { name: "Kenya",    city: "Nairobi",       delay: 26, num: 2 },
  { name: "Uganda",   city: "Kampala",       delay: 40, num: 3 },
  { name: "Rwanda",   city: "Kigali",        delay: 54, num: 4 },
  { name: "Ethiopia", city: "Addis Ababa",   delay: 68, num: 5 },
  { name: "DRC",      city: "Kinshasa",      delay: 82, num: 6 },
];

export function Scene07_Countries() {
  const frame = useCurrentFrame();

  const titleSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.main,
  });

  // Snappy country reveals
  const countries = COUNTRIES.map((country) => {
    const delay = country.delay;
    const t = Math.max(0, Math.min(1, (frame - delay) / 12));
    const s = spring({ frame: t * 30, fps: 30, config: SPRING.snap });

    return {
      ...country,
      opacity: s,
      transform: `translate3d(${(1 - s) * -30}px, 0, 0)`,
      lineWidth: s,
    };
  });

  const statsSpring = spring({
    frame: Math.max(0, frame - 100),
    fps: 30,
    config: SPRING.punch,
  });

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 130) / 12);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 100px",
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
          marginBottom: 16,
          opacity: titleSpring,
          transform: `translate3d(0, ${(1 - titleSpring) * 15}px, 0)`,
        }}
      >
        Coverage
      </div>

      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: COLOR.ink,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: 12,
          textAlign: "center",
          opacity: titleSpring,
          transform: `translate3d(0, ${(1 - titleSpring) * 10}px, 0)`,
        }}
      >
        Buyers across
        <br />
        <span style={{ color: COLOR.brand }}>East Africa.</span>
      </div>

      <div
        style={{
          fontSize: 16,
          color: COLOR.inkSoft,
          fontFamily: "Inter, sans-serif",
          marginBottom: 36,
          textAlign: "center",
          opacity: titleSpring,
        }}
      >
        From Dar es Salaam to Nairobi, Kinshasa to Addis Ababa.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px 40px",
          width: "100%",
          maxWidth: 600,
          marginBottom: 36,
        }}
      >
        {countries.map((country, i) => (
          <div
            key={country.num}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: country.opacity,
              transform: country.transform,
              padding: "10px 16px",
              background: COLOR.surface,
              borderRadius: 12,
              border: `1px solid ${COLOR.border}`,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: COLOR.brand,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                color: "#fff",
                fontFamily: "Inter",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: COLOR.ink,
                  fontFamily: "Inter",
                  letterSpacing: "-0.02em",
                }}
              >
                {country.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: COLOR.inkMute,
                  fontFamily: "Inter",
                }}
              >
                {country.city}
              </div>
            </div>

            <div
              style={{
                width: 60 * country.lineWidth,
                height: 2,
                background: `linear-gradient(90deg, ${COLOR.brand}, transparent)`,
                borderRadius: 99,
                opacity: country.lineWidth * 0.6,
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          opacity: statsSpring,
          transform: `translate3d(0, ${(1 - statsSpring) * 15}px, 0)`,
        }}
      >
        {[
          { value: "6", label: "Countries" },
          { value: "10K+", label: "Listings" },
          { value: "15+", label: "Cities" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "14px 28px",
              background: COLOR.surface,
              borderRadius: 14,
              border: `1px solid ${COLOR.border}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: COLOR.brand,
                fontFamily: "Inter",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: COLOR.inkSoft,
                fontFamily: "Inter",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
