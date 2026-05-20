import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";

export function Scene05_Search() {
  const frame = useCurrentFrame();

  const phoneSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.cinematic,
  });

  const searchSpring = spring({
    frame: Math.max(0, frame - 20),
    fps: 30,
    config: SPRING.snap,
  });

  const resultsSpring = spring({
    frame: Math.max(0, frame - 50),
    fps: 30,
    config: SPRING.main,
  });

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 105) / 15);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      {/* Phone mockup */}
      <div
        style={{
          width: 280,
          height: 560,
          background: COLOR.surface,
          borderRadius: 36,
          border: `1px solid ${COLOR.border}`,
          padding: 24,
          opacity: phoneSpring,
          transform: `translate3d(0, ${(1 - phoneSpring) * 30}px, 0) scale(${0.95 + phoneSpring * 0.05})`,\n          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Search bar */}
        <div
          style={{
            background: COLOR.bg,
            borderRadius: 14,
            border: `2px solid ${COLOR.brand}`,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: searchSpring,
            transform: `translate3d(0, ${(1 - searchSpring) * 15}px, 0)`,\n            boxShadow: `0 0 20px ${COLOR.brandGlow}`,
          }}
        >
          <span style={{ fontSize: 14, color: COLOR.inkMute, fontFamily: "Inter" }}>Search</span>
          <span
            style={{
              fontSize: 14,
              color: COLOR.ink,
              fontFamily: "Inter",
              fontWeight: 500,
              borderRight: `2px solid ${COLOR.brand}`,
              paddingRight: 2,
              animation: frame > 30 ? "blink 1s infinite" : "none",
            }}
          >
            {frame > 30 ? "Toyota Hilux" : ""}
          </span>
        </div>

        {/* Results */}
        <div
          style={{
            opacity: resultsSpring,
            transform: `translate3d(0, ${(1 - resultsSpring) * 20}px, 0)`,\n          }}
        >
          {[
            { name: "Toyota Hilux 2021", price: "TSh 78.5M", loc: "Dar es Salaam" },
            { name: "Toyota Hilux 2019", price: "TSh 65M", loc: "Arusha" },
            { name: "Toyota Hilux 2020", price: "TSh 72M", loc: "Mwanza" },
          ].map((car, i) => (
            <div
              key={i}
              style={{
                background: COLOR.bg,
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                border: `1px solid ${COLOR.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLOR.ink,
                  fontFamily: "Inter",
                  marginBottom: 4,
                }}
              >
                {car.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: COLOR.brand,
                  fontWeight: 700,
                  fontFamily: "Inter",
                }}
              >
                {car.price}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: COLOR.inkMute,
                  fontFamily: "Inter",
                  marginTop: 2,
                }}
              >
                {car.loc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
