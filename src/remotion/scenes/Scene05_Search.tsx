import { interpolate, useCurrentFrame, Audio } from "remotion";
import { COLOR, EASE, RADIUS, SHADOW } from "../design";
import { PhoneFrame } from "../components/PhoneFrame";
import { HomeScreen } from "../components/screens/HomeScreen";
import { ResultsScreen } from "../components/screens/ResultsScreen";
import { Cursor } from "../components/Cursor";
import { TypingText } from "../components/TypingText";

const SEARCH = "Toyota Hilux";

export function Scene05_Search() {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [130, 145], [1, 0], { extrapolateRight: "clamp" });

  // Phone un-tilts and centers - FASTER
  const phoneTilt = interpolate(frame, [0, 15], [8, 0], { extrapolateRight: "clamp", easing: EASE });
  const phoneScale = interpolate(frame, [0, 15], [0.9, 1], { extrapolateRight: "clamp", easing: EASE });

  // Search bar focus timing - FASTER
  const focusStart = 20;
  const typeStart = 30;
  const typeDone = typeStart + (SEARCH.length / 0.8); // ~42 frames

  // Screen transition Home → Results after typing completes
  const homeOp    = interpolate(frame, [typeDone + 10, typeDone + 26], [1, 0], { extrapolateRight: "clamp" });
  const resultsOp = interpolate(frame, [typeDone + 18, typeDone + 34], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const resultsY  = interpolate(frame, [typeDone + 18, typeDone + 34], [20, 0], { extrapolateRight: "clamp", easing: EASE });

  // Hovered card highlight
  const hoverScale = frame >= typeDone + 80
    ? interpolate(frame, [typeDone + 80, typeDone + 92], [1, 1.01], { extrapolateRight: "clamp" })
    : 1;

  // Phone center position (1280×720 frame)
  const phoneLeft = (1280 - 320) / 2;  // 480
  const phoneTop  = (720 - 680) / 2;   // 20

  // Search bar position inside phone
  const searchBarX = phoneLeft + 160;        // 640 — phone center
  const searchBarY = phoneTop + 14 + 44 + 12 + 52 + 10 + 16; // ≈ 168

  // Cursor path: starts bottom-right, moves UP to search bar, hovers, then drifts
  const cursorPath = [
    { frame: 0,   x: 1100, y: 650 },          // starts bottom-right off phone
    { frame: 40,  x: searchBarX + 20, y: searchBarY + 120 }, // moving up
    { frame: 55,  x: searchBarX + 20, y: searchBarY + 40 },  // approaching
    { frame: 65,  x: searchBarX + 20, y: searchBarY + 30 },  // hovering (pause)
    { frame: 75,  x: searchBarX + 20, y: searchBarY + 30 },  // still hovering
    { frame: 140, x: searchBarX + 20, y: searchBarY + 30 },  // stays while typing
    { frame: 180, x: searchBarX + 80, y: searchBarY + 60 },  // drifts away
  ];

  // Focus ring opacity
  const focusOp = interpolate(frame, [focusStart, focusStart + 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: COLOR.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: fadeOut,
    }}>
      {/* Phone */}
      <div style={{
        transform: `scale(${phoneScale})`,
        flexShrink: 0,
      }}>
        <PhoneFrame width={320} height={680} tilt={phoneTilt}>
          {/* Home screen */}
          <div style={{
            position: "absolute", inset: 0,
            opacity: homeOp,
            pointerEvents: "none",
          }}>
            <HomeScreen frame={60} showTyping={false} hideSearchBar={true} />
            
            {/* Focused search bar overlay */}
            <div style={{
              position: "absolute",
              top: 14 + 44 + 12 + 52 + 10, // same as search bar top
              left: 12,
              right: 12,
              opacity: focusOp,
            }}>
              <div style={{
                background: COLOR.bg,
                borderRadius: RADIUS.md,
                border: `2px solid ${COLOR.brand}`,
                boxShadow: `${SHADOW.card}, 0 0 0 4px ${COLOR.brandSoft}, 0 0 20px rgba(0,153,255,0.15)`,
                padding: "9px 12px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 12, opacity: 0.5 }}>🔍</span>
                <div style={{ fontSize: 11, color: COLOR.inkMute, fontFamily: "Inter, sans-serif", flex: 1 }}>
                  {frame >= typeStart ? (
                    <TypingText text={SEARCH} startFrame={typeStart - 60} charsPerFrame={0.5} />
                  ) : (
                    <span>Toyota Hilux, Land Cruiser, Vitz…</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results screen */}
          <div style={{
            position: "absolute", inset: 0,
            opacity: resultsOp,
            transform: `translateY(${resultsY}px)`,
          }}>
            <ResultsScreen frame={Math.max(0, frame - (typeDone + 34))} />
          </div>
        </PhoneFrame>
      </div>

      {/* Sound Effects */}
      {frame === 65 && <Audio src="/audio/sfx/click.mp3" startFrom={0} volume={0.6} />}
      {frame >= 70 && frame <= 90 && frame % 3 === 0 && <Audio src="/audio/sfx/type.mp3" startFrom={0} volume={0.3} />}
      
      {/* Cursor */}
      <Cursor path={cursorPath} clickFrame={65} startFrame={0} hideFrame={200} />

      {/* Step 2 badge — bottom left */}
      {(() => {
        const badgeOp = interpolate(frame, [130, 146], [0, 1], { extrapolateRight: "clamp", easing: EASE });
        const badgeY  = interpolate(frame, [130, 146], [10, 0], { extrapolateRight: "clamp", easing: EASE });
        return (
          <div style={{
            position: "absolute", bottom: 48, left: 72,
            display: "inline-flex", alignItems: "center", gap: 10,
            background: COLOR.brandSoft,
            border: `1px solid rgba(0,153,255,0.18)`,
            borderRadius: RADIUS.md,
            padding: "10px 16px",
            opacity: badgeOp,
            transform: `translateY(${badgeY}px)`,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: COLOR.brand, color: "#fff",
              fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Inter, sans-serif", flexShrink: 0,
            }}>2</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLOR.brandInk, fontFamily: "Inter, sans-serif" }}>
                Buyers find you
              </div>
              <div style={{ fontSize: 11, color: COLOR.inkMute, fontFamily: "Inter, sans-serif" }}>
                WhatsApp direct · 0 middlemen
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
