import { interpolate } from "remotion";
import { COLOR, EASE, RADIUS } from "../../design";

interface ChatScreenProps {
  frame: number;
}

const MESSAGES = [
  { from: "buyer",  text: "Habari! Is the Hilux still available?" },
  { from: "seller", text: "Yes — when can you come see it?" },
  { from: "buyer",  text: "Tomorrow 10am, Mikocheni?" },
  { from: "seller", text: "Sawa, see you then 👍" },
];

export function ChatScreen({ frame }: ChatScreenProps) {
  const headerOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const successOp = interpolate(frame, [MESSAGES.length * 14 + 10, MESSAGES.length * 14 + 28], [0, 1], {
    extrapolateRight: "clamp", easing: EASE,
  });
  const successY = interpolate(frame, [MESSAGES.length * 14 + 10, MESSAGES.length * 14 + 28], [16, 0], {
    extrapolateRight: "clamp", easing: EASE,
  });

  return (
    <div style={{ height: "100%", background: COLOR.bg, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{
        background: COLOR.brand,
        padding: "12px 14px 10px",
        display: "flex", alignItems: "center", gap: 10,
        opacity: headerOp, flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28,
          background: COLOR.brandSoft,
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, color: COLOR.brandInk,
          fontFamily: "Inter, sans-serif",
          flexShrink: 0,
        }}>
          JM
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "Inter, sans-serif" }}>
            John Mwakasege
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", fontFamily: "Inter, sans-serif" }}>
            Seller · Verified ✓
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: "12px 12px 8px",
        display: "flex", flexDirection: "column", gap: 8,
        overflowY: "hidden",
        background: "#f0f2f5",
      }}>
        {MESSAGES.map((msg, i) => {
          const op = interpolate(frame, [i * 14 + 4, i * 14 + 22], [0, 1], { extrapolateRight: "clamp", easing: EASE });
          const y  = interpolate(frame, [i * 14 + 4, i * 14 + 22], [8, 0],  { extrapolateRight: "clamp", easing: EASE });
          const isSeller = msg.from === "seller";

          return (
            <div key={i} style={{
              display: "flex",
              justifyContent: isSeller ? "flex-start" : "flex-end",
              opacity: op,
              transform: `translateY(${y}px)`,
            }}>
              <div style={{
                maxWidth: "75%",
                padding: "8px 11px",
                borderRadius: RADIUS.md,
                borderTopLeftRadius: isSeller ? 4 : RADIUS.md,
                borderTopRightRadius: isSeller ? RADIUS.md : 4,
                background: isSeller ? COLOR.bg : COLOR.brand,
                color: isSeller ? COLOR.ink : "#fff",
                fontSize: 10,
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Success card */}
        <div style={{
          opacity: successOp,
          transform: `translateY(${successY}px)`,
          background: COLOR.bg,
          borderRadius: RADIUS.md,
          border: `1px solid ${COLOR.border}`,
          borderLeft: `3px solid ${COLOR.ok}`,
          padding: "10px 12px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 14 }}>✅</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: COLOR.ink, fontFamily: "Inter, sans-serif" }}>
              Test drive booked
            </div>
            <div style={{ fontSize: 8, color: COLOR.inkSoft, fontFamily: "Inter, sans-serif" }}>
              Tomorrow, 10:00 AM · Mikocheni
            </div>
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        padding: "8px 12px",
        borderTop: `1px solid ${COLOR.border}`,
        background: COLOR.bg,
        display: "flex", gap: 8, alignItems: "center",
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1, background: COLOR.surface, borderRadius: 99,
          border: `1px solid ${COLOR.border}`,
          padding: "7px 12px",
          fontSize: 9, color: COLOR.inkMute, fontFamily: "Inter, sans-serif",
        }}>
          Message…
        </div>
        <div style={{
          width: 28, height: 28,
          background: COLOR.brand, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 11,
        }}>
          →
        </div>
      </div>
    </div>
  );
}
