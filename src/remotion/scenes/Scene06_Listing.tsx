import { interpolate, useCurrentFrame, Audio } from "remotion";
import { COLOR, EASE, RADIUS } from "../design";
import { PhoneFrame } from "../components/PhoneFrame";
import { DetailScreen } from "../components/screens/DetailScreen";
import { ChatScreen } from "../components/screens/ChatScreen";
import { Cursor } from "../components/Cursor";

export function Scene06_Listing() {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [228, 240], [1, 0], { extrapolateRight: "clamp" });

  // Detail → Chat transition at frame 120
  const detailOp = interpolate(frame, [110, 128], [1, 0], { extrapolateRight: "clamp" });
  const chatOp   = interpolate(frame, [118, 136], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const chatY    = interpolate(frame, [118, 136], [24, 0], { extrapolateRight: "clamp", easing: EASE });

  const phoneLeft = (1280 - 320) / 2;  // 480
  const phoneTop  = (720 - 680) / 2;   // 20

  // bezel=14, topbar=44, photo=140, padding=12, title=20, gap=10, price=30, gap=10,
  // specs=82, gap=10, location=24, gap=10, WA btn center = +20
  const wpBtnX = phoneLeft + 160;  // 640
  const wpBtnY = phoneTop + 14 + 44 + 140 + 12 + 20 + 10 + 30 + 10 + 82 + 10 + 24 + 10 + 20; // ≈ 446

  const cursorPath = [
    { frame: 0,   x: phoneLeft + 100, y: phoneTop + 200 }, // starts at price area
    { frame: 35,  x: wpBtnX,          y: wpBtnY + 20 },    // approaching button
    { frame: 70,  x: wpBtnX,          y: wpBtnY },         // hovering button
    { frame: 100, x: wpBtnX,          y: wpBtnY },         // click
    { frame: 160, x: wpBtnX + 80,     y: wpBtnY + 60 },   // drift after
  ];

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: COLOR.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: fadeOut,
    }}>
      <PhoneFrame width={320} height={680} tilt={0}>
        {/* Detail screen */}
        <div style={{ position: "absolute", inset: 0, opacity: detailOp }}>
          <DetailScreen frame={frame} />
        </div>

        {/* Chat screen */}
        <div style={{
          position: "absolute", inset: 0,
          opacity: chatOp,
          transform: `translateY(${chatY}px)`,
        }}>
          <ChatScreen frame={Math.max(0, frame - 128)} />
        </div>
      </PhoneFrame>

      {/* Sound Effects */}
      {frame === 100 && <Audio src="/audio/sfx/click.mp3" startFrom={0} volume={0.6} />}
      
      {/* Cursor */}
      <Cursor path={cursorPath} clickFrame={100} startFrame={0} hideFrame={190} />

      {/* Step 3 badge — bottom right */}
      {(() => {
        const badgeOp = interpolate(frame, [148, 164], [0, 1], { extrapolateRight: "clamp", easing: EASE });
        const badgeY  = interpolate(frame, [148, 164], [10, 0], { extrapolateRight: "clamp", easing: EASE });
        return (
          <div style={{
            position: "absolute", bottom: 48, right: 72,
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "#F0FDF4",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: RADIUS.md,
            padding: "10px 16px",
            opacity: badgeOp,
            transform: `translateY(${badgeY}px)`,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "#10B981", color: "#fff",
              fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Inter, sans-serif", flexShrink: 0,
            }}>3</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#065F46", fontFamily: "Inter, sans-serif" }}>
                Deal done ✓
              </div>
              <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "Inter, sans-serif" }}>
                Sold. No commission.
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
