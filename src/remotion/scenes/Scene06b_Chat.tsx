import { interpolate, useCurrentFrame, Audio } from "remotion";
import { COLOR, EASE, RADIUS } from "../design";
import { PhoneFrame } from "../components/PhoneFrame";
import { Cursor } from "../components/Cursor";

export function Scene06b_Chat() {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [155, 170], [1, 0], { extrapolateRight: "clamp" });

  // Messages - FASTER
  const messages = [
    { text: "Habari! Is the Hilux still available?", from: "buyer", delay: 8 },
    { text: "Yes — when can you come see it?", from: "seller", delay: 22 },
    { text: "Tomorrow 10am, Mikocheni?", from: "buyer", delay: 36 },
    { text: "Sawa, see you then 👍", from: "seller", delay: 50 },
  ];

  // Action buttons appearing
  const actionsOp = interpolate(frame, [70, 82], [0, 1], { extrapolateRight: "clamp", easing: EASE });

  const phoneLeft = (1280 - 320) / 2;
  const phoneTop = (720 - 680) / 2;

  // Cursor to WhatsApp button
  const cursorPath = [
    { frame: 0, x: phoneLeft + 120, y: phoneTop + 300 },
    { frame: 25, x: phoneLeft + 160, y: phoneTop + 520 },
    { frame: 40, x: phoneLeft + 160, y: phoneTop + 520 },
  ];

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: COLOR.bg,
      display: "flex", alignItems: "center",
      padding: "0 80px",
      opacity: fadeOut,
    }}>
      {/* Left text */}
      <div style={{ flex: 1, paddingRight: 50, maxWidth: 480 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: COLOR.brand,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.12em", textTransform: "uppercase",
          marginBottom: 16,
          opacity: interpolate(frame, [5, 15], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          Connect Instantly
        </div>

        <div style={{
          fontSize: 42, fontWeight: 800,
          color: COLOR.ink,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: 16,
          opacity: interpolate(frame, [8, 18], [0, 1], { extrapolateRight: "clamp", easing: EASE }),
        }}>
          Chat, Call, or
          <br />
          <span style={{ color: COLOR.brand }}>WhatsApp</span>
        </div>

        <div style={{
          fontSize: 15,
          color: COLOR.inkSoft,
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.5,
          marginBottom: 24,
          opacity: interpolate(frame, [12, 22], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          No middlemen. Talk directly to sellers. Book test drives. Negotiate price. All in one place.
        </div>

        {/* Feature pills */}
        <div style={{
          display: "flex",
          gap: 10,
          opacity: interpolate(frame, [18, 28], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          {["In-app Chat", "Voice Calls", "WhatsApp", "Test Drive Booking"].map((feat, i) => (
            <div key={i} style={{
              background: COLOR.brandSoft,
              color: COLOR.brandInk,
              padding: "6px 14px",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "Inter",
              border: `1px solid ${COLOR.brand}30`,
            }}>
              {feat}
            </div>
          ))}
        </div>
      </div>

      {/* Phone */}
      <div style={{ flexShrink: 0 }}>
        <PhoneFrame width={320} height={680} tilt={-4}>
          <div style={{ height: "100%", background: "#f0f2f5", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{
              background: COLOR.brand,
              padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 36, height: 36,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "white",
              }}>
                JM
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white", fontFamily: "Inter" }}>John Mwakasege</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", fontFamily: "Inter" }}>Online now</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {messages.map((msg, i) => {
                const op = interpolate(frame, [msg.delay, msg.delay + 10], [0, 1], { extrapolateRight: "clamp" });
                const y = interpolate(frame, [msg.delay, msg.delay + 10], [6, 0], { extrapolateRight: "clamp" });
                const isBuyer = msg.from === "buyer";

                return (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: isBuyer ? "flex-end" : "flex-start",
                    opacity: op,
                    transform: `translateY(${y}px)`,
                  }}>
                    <div style={{
                      maxWidth: "75%",
                      padding: "8px 12px",
                      borderRadius: RADIUS.md,
                      borderTopRightRadius: isBuyer ? 4 : RADIUS.md,
                      borderTopLeftRadius: isBuyer ? RADIUS.md : 4,
                      background: isBuyer ? COLOR.brand : "white",
                      color: isBuyer ? "white" : COLOR.ink,
                      fontSize: 11,
                      fontFamily: "Inter",
                      fontWeight: 500,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={{
              padding: "12px",
              background: "white",
              borderTop: `1px solid ${COLOR.border}`,
              opacity: actionsOp,
            }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{
                  flex: 1,
                  background: "#25D366",
                  color: "white",
                  padding: "10px",
                  borderRadius: RADIUS.lg,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "Inter",
                }}>
                  💬 WhatsApp
                </div>
                <div style={{
                  flex: 1,
                  background: COLOR.brand,
                  color: "white",
                  padding: "10px",
                  borderRadius: RADIUS.lg,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "Inter",
                }}>
                  📞 Call
                </div>
              </div>
              <div style={{
                background: COLOR.bg,
                border: `1.5px solid ${COLOR.border}`,
                borderRadius: RADIUS.lg,
                padding: "10px",
                textAlign: "center",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "Inter",
                color: COLOR.ink,
              }}>
                📅 Book Test Drive
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>

      <Cursor path={cursorPath} clickFrame={40} startFrame={0} hideFrame={90} />
    </div>
  );
}
