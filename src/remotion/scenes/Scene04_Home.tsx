import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, EASE, RADIUS } from "../design";
import { PhoneFrame } from "../components/PhoneFrame";
import { HomeScreen } from "../components/screens/HomeScreen";

const CAPTIONS = ["Verified listings.", "Real prices.", "Across 5 countries."];

export function Scene04_Home() {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [90, 100], [1, 0], { extrapolateRight: "clamp" });

  // Phone slides in from right - FASTER
  const phoneX = interpolate(frame, [5, 18], [180, 0], { extrapolateRight: "clamp", easing: EASE });
  const phoneOp = interpolate(frame, [5, 16], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const tilt = 8;

  // Left captions stagger in - FASTER
  const capAnims = CAPTIONS.map((_, i) => ({
    op: interpolate(frame, [20 + i * 6, 30 + i * 6], [0, 1], { extrapolateRight: "clamp", easing: EASE }),
    y:  interpolate(frame, [20 + i * 6, 30 + i * 6], [10, 0], { extrapolateRight: "clamp", easing: EASE }),
  }));

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: COLOR.bg,
      display: "flex", alignItems: "center",
      padding: "0 80px",
      opacity: fadeOut,
    }}>
      {/* Left text panel */}
      <div style={{ flex: 1, paddingRight: 60, maxWidth: 520 }}>
        {CAPTIONS.map((cap, i) => (
          <div key={i} style={{
            fontSize: 30,
            fontWeight: 700,
            fontFamily: "Inter, system-ui, sans-serif",
            color: COLOR.ink,
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
            marginBottom: 12,
            opacity: capAnims[i].op,
            transform: `translateY(${capAnims[i].y}px)`,
          }}>
            {cap}
          </div>
        ))}

        {/* Step 1 badge */}
        {(() => {
          const badgeOp = interpolate(frame, [115, 130], [0, 1], { extrapolateRight: "clamp", easing: EASE });
          const badgeY  = interpolate(frame, [115, 130], [10, 0], { extrapolateRight: "clamp", easing: EASE });
          return (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: COLOR.brandSoft,
              border: `1px solid rgba(0,153,255,0.18)`,
              borderRadius: RADIUS.md,
              padding: "10px 16px",
              marginTop: 16,
              opacity: badgeOp,
              transform: `translateY(${badgeY}px)`,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: COLOR.brand,
                color: "#fff", fontSize: 11, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Inter, sans-serif",
                flexShrink: 0,
              }}>1</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLOR.brandInk, fontFamily: "Inter, sans-serif" }}>
                  Post your car
                </div>
                <div style={{ fontSize: 11, color: COLOR.inkMute, fontFamily: "Inter, sans-serif" }}>
                  Free · Takes 2 minutes
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Phone */}
      <div style={{
        opacity: phoneOp,
        transform: `translateX(${phoneX}px)`,
        flexShrink: 0,
      }}>
        <PhoneFrame width={320} height={680} tilt={tilt}>
          <HomeScreen frame={Math.max(0, frame - 30)} />
        </PhoneFrame>
      </div>
    </div>
  );
}
