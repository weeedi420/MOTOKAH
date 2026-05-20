import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";

const COUNTRIES = [
  { name: "Tanzania", city: "Dar es Salaam", flag: "TZ" },
  { name: "Kenya", city: "Nairobi", flag: "KE" },
  { name: "Uganda", city: "Kampala", flag: "UG" },
  { name: "Rwanda", city: "Kigali", flag: "RW" },
  { name: "Burundi", city: "Bujumbura", flag: "BI" },
];

export function Scene07_Countries() {
  const frame = useCurrentFrame();

  // Title reveal
  const titleSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.main,
  });

  // Subtitle reveal
  const subtitleSpring = spring({
    frame: Math.max(0, frame - 15),
    fps: 30,
    config: SPRING.cinematic,
  });

  // Countries: staggered spring reveal with blur-to-sharp
  const countries = COUNTRIES.map((country, i) => {
    const delay = 25 + i * 12;
    const t = Math.max(0, Math.min(1, (frame - delay) / 20));
    const s = spring({ frame: t * 30, fps: 30, config: SPRING.elastic });

    // Pulse effect when country appears
    const pulse = s > 0.8 ? 1 + 0.02 * Math.sin(frame * 0.2) : 1;

    return {
      ...country,
      opacity: s,
      transform: `translate3d(${(1 - s) * -40}px, ${(1 - s) * 30}px, 0) scale(${pulse})`,
      filter: `blur(${(1 - s) * 10}px)`,
      lineWidth: s,
    };
  });

  // Stats badge spring
  const statsSpring = spring({
    frame: Math.max(0, frame - 95),
    fps: 30,
    config: SPRING.snap,
  });

  // Fade out
  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 110) / 15);

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
      }}
    >
      {/* Section eyebrow */}
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
          transform: `translate3d(0, ${(1 - titleSpring) * 20}px, 0)`,
          filter: `blur(${(1 - titleSpring) * 6}px)`,
        }}
      >
        Coverage
      </div>

      {/* Headline */}
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
          transform: `translate3d(0, ${(1 - titleSpring) * 15}px, 0)`,
          filter: `blur(${(1 - titleSpring) * 8}px)`,
        }}
      >
        Five Countries.
        <br />
        <span style={{ color: COLOR.brand }}>One Platform.</span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 17,
          fontWeight: 400,
          color: COLOR.inkSoft,
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.5,
          marginBottom: 48,
          textAlign: "center",
          maxWidth: 500,
          opacity: subtitleSpring,
          transform: `translate3d(0, ${(1 - subtitleSpring) * 12}px, 0)`,
          filter: `blur(${(1 - subtitleSpring) * 4}px)`,
        }}
      >
        From Dar es Salaam to Nairobi, Kampala to Kigali.
      </div>

      {/* Countries list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          width: "100%",
          maxWidth: 560,
        }}
      >
        {countries.map((country, i) => (
          <div
            key={country.flag}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: country.opacity,
              transform: country.transform,
              filter: country.filter,
            }}
          >
            {/* Number */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${COLOR.brand}, ${COLOR.accent})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 800,
                color: COLOR.bg,
                fontFamily: "Inter",
                flexShrink: 0,
                boxShadow: `0 0 20px ${COLOR.brandGlow}`,
              }}
            >
              {i + 1}
            </div>

            {/* Country info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 24,
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
                  fontSize: 13,
                  color: COLOR.inkMute,
                  fontFamily: "Inter",
                  marginTop: 2,
                }}
              >
                {country.city}
              </div>
            </div>

            {/* Animated line */}
            <div
              style={{
                width: 120 * country.lineWidth,
                height: 2,
                background: `linear-gradient(90deg, ${COLOR.brand}, transparent)`,
                borderRadius: 99,
                opacity: country.lineWidth * 0.6,
              }}
            />
          </div>
        ))}
      </div>

      {/* Stats badge */}
      <div
        style={{
          marginTop: 48,
          display: "flex",
          gap: 32,
          opacity: statsSpring,
          transform: `translate3d(0, ${(1 - statsSpring) * 20}px, 0)`,
          filter: `blur(${(1 - statsSpring) * 6}px)`,
        }}
      >
        {[
          { value: "5", label: "Countries" },
          { value: "10K+", label: "Listings" },
          { value: "9", label: "Cities" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "16px 28px",
              background: "rgba(245,166,35,0.08)",
              borderRadius: 16,
              border: `1px solid ${COLOR.brandSoft}`,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: COLOR.brand,
                fontFamily: "Inter",
                lineHeight: 1,
                textShadow: `0 0 20px ${COLOR.brandGlow}`,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLOR.inkSoft,
                fontFamily: "Inter",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginTop: 6,
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
