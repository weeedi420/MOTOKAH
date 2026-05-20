import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";

const COUNTRIES = [
  { name: "Tanzania", city: "Dar es Salaam", delay: 28, num: 1 },
  { name: "Kenya",    city: "Nairobi",       delay: 53, num: 2 },
  { name: "Uganda",   city: "Kampala",       delay: 69, num: 3 },
  { name: "Rwanda",   city: "Kigali",        delay: 88, num: 4 },
  { name: "Burundi",  city: "Bujumbura",     delay: 109, num: 5 },
];

export function Scene07_Countries() {
  const frame = useCurrentFrame();

  const titleSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.main,
  });

  const countries = COUNTRIES.map((country) =>> {
    const delay = country.delay;
    const t = Math.max(0, Math.min(1, (frame - delay) / 20));
    const s = spring({ frame: t * 30, fps: 30, config: SPRING.elastic });

    return {
      ...country,
      opacity: s,
      transform: `translate3d(${(1 - s) * -40}px, ${(1 - s) * 20}px, 0)`,
      lineWidth: s,
    };
  });

  const statsSpring = spring({
    frame: Math.max(0, frame - 125),
    fps: 30,
    config: SPRING.snap,
  });

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 170) / 15);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 80px",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLOR.brand,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 12,
          opacity: titleSpring,
          transform: `translate3d(0, ${(1 - titleSpring) * 15}px, 0)`,
        }}
      >
        Coverage
      </div>

      <div
        style={{
          fontSize: 42,
          fontWeight: 800,
          color: COLOR.ink,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: 8,
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
          fontSize: 15,
          color: COLOR.inkSoft,
          fontFamily: "Inter, sans-serif",
          marginBottom: 32,
          textAlign: "center",
          opacity: titleSpring,
        }}
      >
        From Dar es Salaam to Nairobi, Kampala to Kigali.
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
          maxWidth: 480,
          marginBottom: 32,
        }}
      >
        {countries.map((country, i) => (
          <div
            key={country.num}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: country.opacity,
              transform: country.transform,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: COLOR.brand,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
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
                  fontSize: 22,
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
                  fontSize: 12,
                  color: COLOR.inkMute,
                  fontFamily: "Inter",
                }}
              >
                {country.city}
              </div>
            </div>

            <div
              style={{
                width: 100 * country.lineWidth,
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
          { value: "5", label: "Countries" },
          { value: "10K+", label: "Listings" },
          { value: "9", label: "Cities" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "14px 24px",
              background: COLOR.surface,
              borderRadius: 14,
              border: `1px solid ${COLOR.border}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontSize: 28,
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
