import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";

const MESSAGES = [
  { text: "Habari! Is the Hilux still available?", from: "buyer", delay: 5 },
  { text: "Yes — when can you come see it?", from: "seller", delay: 20 },
  { text: "Tomorrow 10am, Mikocheni?", from: "buyer", delay: 35 },
  { text: "Sawa, see you then!", from: "seller", delay: 50 },
];

export function Scene06b_Chat() {
  const frame = useCurrentFrame();

  const phoneSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.cinematic,
  });

  const messages = MESSAGES.map((msg) => {
    const t = Math.max(0, Math.min(1, (frame - msg.delay) / 12));
    const s = spring({ frame: t * 30, fps: 30, config: SPRING.snap });
    const isBuyer = msg.from === "buyer";

    return {
      ...msg,
      opacity: s,
      transform: `translate3d(${(1 - s) * (isBuyer ? 30 : -30)}px, 0, 0)`,
      filter: `blur(${(1 - s) * 6}px)`,
    };
  });

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 70) / 15);

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
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          opacity: phoneSpring,
          transform: `translate3d(0, ${(1 - phoneSpring) * 30}px, 0) scale(${0.95 + phoneSpring * 0.05})`,
          filter: `blur(${(1 - phoneSpring) * 8}px)`,
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${COLOR.brand}, #D4891A)`,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: "white",
              fontFamily: "Inter",
            }}
          >
            JM
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                fontFamily: "Inter",
              }}
            >
              John Mwakasege
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.7)",
                fontFamily: "Inter",
              }}
            >
              Online now
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            overflow: "hidden",
          }}
        >
          {messages.map((msg, i) => {
            const isBuyer = msg.from === "buyer";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isBuyer ? "flex-end" : "flex-start",
                  opacity: msg.opacity,
                  transform: msg.transform,
                  filter: msg.filter,
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: 16,
                    borderBottomRightRadius: isBuyer ? 4 : 16,
                    borderBottomLeftRadius: isBuyer ? 16 : 4,
                    background: isBuyer
                      ? `linear-gradient(135deg, ${COLOR.brand}, #D4891A)`
                      : COLOR.bg,
                    color: isBuyer ? "#0A0A0F" : COLOR.ink,
                    fontSize: 12,
                    fontFamily: "Inter",
                    fontWeight: 500,
                    boxShadow: isBuyer
                      ? `0 2px 8px ${COLOR.brandGlow}`
                      : "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div
          style={{
            padding: 14,
            background: COLOR.bg,
            borderTop: `1px solid ${COLOR.border}`,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div
              style={{
                flex: 1,
                background: "#25D366",
                color: "white",
                padding: "10px",
                borderRadius: 12,
                textAlign: "center",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "Inter",
              }}
            >
              WhatsApp
            </div>
            <div
              style={{
                flex: 1,
                background: COLOR.brand,
                color: "#0A0A0F",
                padding: "10px",
                borderRadius: 12,
                textAlign: "center",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "Inter",
              }}
            >
              Call
            </div>
          </div>
          <div
            style={{
              background: COLOR.surface,
              border: `1.5px solid ${COLOR.border}`,
              borderRadius: 12,
              padding: "10px",
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "Inter",
              color: COLOR.ink,
            }}
          >
            Book Test Drive
          </div>
        </div>
      </div>
    </div>
  );
}
