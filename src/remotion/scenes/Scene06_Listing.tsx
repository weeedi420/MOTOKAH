import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";

export function Scene06_Listing() {
  const frame = useCurrentFrame();

  const phoneSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.cinematic,
  });

  const contentSpring = spring({
    frame: Math.max(0, frame - 15),
    fps: 30,
    config: SPRING.main,
  });

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 50) / 15);

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
      <div
        style={{
          width: 280,
          height: 560,
          background: COLOR.surface,
          borderRadius: 36,
          border: `1px solid ${COLOR.border}`,
          padding: 0,
          overflow: "hidden",
          opacity: phoneSpring,
          transform: `translate3d(0, ${(1 - phoneSpring) * 30}px, 0) scale(${0.95 + phoneSpring * 0.05})`,
          filter: `blur(${(1 - phoneSpring) * 8}px)`,
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Car image placeholder */}
        <div
          style={{
            height: 200,
            background: `linear-gradient(135deg, ${COLOR.brand}20, ${COLOR.accent}10)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: COLOR.inkMute,
            fontFamily: "Inter",
          }}
        >
          Toyota Hilux 2021
        </div>

        {/* Details */}
        <div
          style={{
            padding: 20,
            opacity: contentSpring,
            transform: `translate3d(0, ${(1 - contentSpring) * 20}px, 0)`,
            filter: `blur(${(1 - contentSpring) * 6}px)`,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: COLOR.ink,
              fontFamily: "Inter",
              marginBottom: 8,
            }}
          >
            Toyota Hilux 2021
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: COLOR.brand,
              fontFamily: "Inter",
              marginBottom: 16,
              textShadow: `0 0 20px ${COLOR.brandGlow}`,
            }}
          >
            TSh 78,500,000
          </div>

          {[
            "45,000 km",
            "Dar es Salaam",
            "Manual Transmission",
            "Diesel",
          ].map((detail, i) => (
            <div
              key={i}
              style={{
                fontSize: 13,
                color: COLOR.inkSoft,
                fontFamily: "Inter",
                padding: "8px 0",
                borderBottom: `1px solid ${COLOR.border}`,
              }}
            >
              {detail}
            </div>
          ))}

          <div
            style={{
              background: `linear-gradient(135deg, ${COLOR.brand}, #D4891A)`,
              color: "#0A0A0F",
              borderRadius: 14,
              padding: "14px",
              textAlign: "center",
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "Inter",
              marginTop: 16,
              boxShadow: `0 0 20px ${COLOR.brandGlow}`,
            }}
          >
            Contact Seller
          </div>
        </div>
      </div>
    </div>
  );
}
