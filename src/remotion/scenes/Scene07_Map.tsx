import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, EASE } from "../design";
import { RealEastAfricaMap } from "../components/RealEastAfricaMap";

export function Scene07_Map() {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [140, 155], [1, 0], { extrapolateRight: "clamp" });

  // Title animations - FASTER
  const titleOp = interpolate(frame, [10, 22], [0, 1], { extrapolateRight: "clamp", easing: EASE.outExpo });
  const titleY  = interpolate(frame, [10, 22], [14, 0], { extrapolateRight: "clamp", easing: EASE.outExpo });

  // Stats row - FASTER
  const statsOp = interpolate(frame, [80, 92], [0, 1], { extrapolateRight: "clamp", easing: EASE.outExpo });

  const stats = [
    { value: "5", label: "Countries" },
    { value: "10K+", label: "Listings" },
    { value: "9", label: "Cities" },
  ];

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: COLOR.bg,
      display: "flex", alignItems: "center",
      padding: "0 48px",
      gap: 24,
      opacity: fadeOut,
    }}>
      {/* Map - left */}
      <div style={{ flexShrink: 0 }}>
        <RealEastAfricaMap frame={frame} />
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        opacity: titleOp,
        transform: `translateY(${titleY}px)`,
      }}>
        {/* Section eyebrow */}
        <div style={{
          fontSize: 11, fontWeight: 700, color: COLOR.brand,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.12em", textTransform: "uppercase",
          marginBottom: 12,
        }}>
          Coverage
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 40, fontWeight: 800,
          color: COLOR.ink,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: 16,
        }}>
          East Africa.
          <br />
          <span style={{ color: COLOR.brand }}>5 countries</span>.
          <br />
          1 platform.
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 15,
          fontWeight: 500,
          color: COLOR.inkSoft,
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.5,
          marginBottom: 28,
          maxWidth: 340,
        }}>
          From Dar es Salaam to Nairobi, Kampala to Kigali. 
          Find cars across the entire region.
        </div>

        {/* Stats */}
        <div style={{
          display: "flex",
          gap: 24,
          opacity: statsOp,
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              textAlign: "center",
              padding: "12px 20px",
              background: COLOR.brandSoft,
              borderRadius: 12,
              border: `1px solid ${COLOR.brand}20`,
            }}>
              <div style={{
                fontSize: 24,
                fontWeight: 800,
                color: COLOR.brand,
                fontFamily: "Inter",
                lineHeight: 1,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                color: COLOR.inkSoft,
                fontFamily: "Inter",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: 4,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
