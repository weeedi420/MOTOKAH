import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Screen 0: Homepage hero
function Screen0({ frame }: { frame: number }) {
  const SEARCH = "Toyota Hilux";
  const charCount = Math.min(SEARCH.length, Math.floor(interpolate(frame, [20, 70], [0, SEARCH.length], { extrapolateRight: "clamp" })));
  const cursorVisible = Math.floor(frame / 18) % 2 === 0;

  return (
    <div style={{ padding: "14px 12px", fontFamily: "Inter, sans-serif", height: "100%" }}>
      {/* Status bar */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "#667", marginBottom: 6 }}>
        <span>9:41</span><span style={{ color: "#0099FF" }}>●●●</span>
      </div>
      {/* App header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#0099FF", letterSpacing: -0.5 }}>motokah</div>
        <div style={{ fontSize: 8, color: "#556", background: "rgba(0,153,255,0.1)", borderRadius: 6, padding: "2px 6px" }}>🇹🇿 Tanzania</div>
      </div>
      {/* Hero text */}
      <div style={{ fontSize: 11, fontWeight: 900, color: "#e0f0ff", marginBottom: 3, lineHeight: 1.3 }}>
        Find Used Cars<br />in <span style={{ color: "#0099FF" }}>Tanzania</span>
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {["Cars", "Commercial", "Bikes"].map((t, i) => (
          <div key={i} style={{
            padding: "3px 8px", borderRadius: 8, fontSize: 8, fontWeight: 700,
            background: i === 0 ? "#0099FF" : "rgba(255,255,255,0.06)",
            color: i === 0 ? "#fff" : "#667",
            border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
          }}>{t}</div>
        ))}
      </div>
      {/* Search bar */}
      <div style={{
        background: "rgba(0,153,255,0.08)", borderRadius: 10,
        padding: "7px 10px", fontSize: 9, color: frame < 20 ? "#446" : "#c0d8f0",
        border: "1px solid rgba(0,153,255,0.3)", marginBottom: 8,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{ color: "#446" }}>🔍</span>
        <span>{SEARCH.slice(0, charCount)}{cursorVisible && frame > 18 ? "|" : ""}</span>
      </div>
      {/* Feature pills */}
      <div style={{ display: "flex", gap: 4 }}>
        {["🔥 Hot Deals", "⭐ Featured"].map((p, i) => (
          <div key={i} style={{
            padding: "3px 8px", borderRadius: 12, fontSize: 8,
            background: i === 0 ? "rgba(255,80,0,0.15)" : "rgba(232,168,53,0.15)",
            color: i === 0 ? "#ff6030" : "#E8A835",
            border: `1px solid ${i === 0 ? "rgba(255,80,0,0.3)" : "rgba(232,168,53,0.3)"}`,
            fontWeight: 700,
          }}>{p}</div>
        ))}
      </div>
    </div>
  );
}

// Screen 1: Search results
function Screen1() {
  const CARS = [
    { title: "Toyota Hilux D-Cab 2020", price: "45M TZS", loc: "Dar es Salaam", year: "2020", km: "48,000 km", badge: "Hot Deal" },
    { title: "Land Cruiser Prado 2019", price: "120M TZS", loc: "Arusha", year: "2019", km: "65,000 km", badge: "" },
  ];
  return (
    <div style={{ padding: "10px 10px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 9, color: "#e0f0ff", fontWeight: 700 }}>2,841 vehicles found</span>
        <span style={{ fontSize: 8, color: "#446" }}>Sort ↕</span>
      </div>
      {/* Active filter chip */}
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        <div style={{ padding: "2px 7px", borderRadius: 10, background: "rgba(0,153,255,0.15)", color: "#0099FF", fontSize: 8, fontWeight: 700 }}>
          Toyota ×
        </div>
        <div style={{ padding: "2px 7px", borderRadius: 10, background: "rgba(0,153,255,0.15)", color: "#0099FF", fontSize: 8, fontWeight: 700 }}>
          Used ×
        </div>
      </div>
      {CARS.map((c, i) => (
        <div key={i} style={{
          background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 8,
          marginBottom: 8, border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{
            height: 56, background: "linear-gradient(135deg,#0d1e2e,#061018)",
            borderRadius: 7, marginBottom: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            <span style={{ fontSize: 26 }}>🚙</span>
            {c.badge && (
              <div style={{
                position: "absolute", top: 4, left: 4,
                background: "#ff4400", color: "#fff",
                fontSize: 7, fontWeight: 800, padding: "2px 5px", borderRadius: 4,
              }}>{c.badge}</div>
            )}
          </div>
          <div style={{ fontSize: 9, color: "#e0f0ff", fontWeight: 700, marginBottom: 3 }}>{c.title}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#0099FF", fontWeight: 900 }}>{c.price}</span>
            <span style={{ fontSize: 8, color: "#556" }}>📍 {c.loc}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 7, color: "#446", background: "rgba(255,255,255,0.05)", padding: "1px 5px", borderRadius: 4 }}>📅 {c.year}</span>
            <span style={{ fontSize: 7, color: "#446", background: "rgba(255,255,255,0.05)", padding: "1px 5px", borderRadius: 4 }}>⏲ {c.km}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Screen 2: Listing detail with WhatsApp CTA
function Screen2({ frame }: { frame: number }) {
  const wpPulse = 1 + 0.07 * Math.sin((frame / 20) * Math.PI * 2);
  return (
    <div style={{ padding: "10px 10px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ fontSize: 10, color: "#e0f0ff", fontWeight: 900, marginBottom: 6 }}>Toyota Hilux 2020 D-Cab</div>
      <div style={{
        height: 80, background: "linear-gradient(135deg,#0c1e30,#061018)",
        borderRadius: 8, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid rgba(0,153,255,0.15)",
      }}>
        <span style={{ fontSize: 36 }}>🚙</span>
      </div>
      {/* Price badge */}
      <div style={{
        background: "rgba(0,153,255,0.12)", border: "1px solid rgba(0,153,255,0.3)",
        borderRadius: 8, padding: "6px 10px", marginBottom: 8, textAlign: "center",
      }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#0099FF" }}>45,000,000 TZS</div>
        <div style={{ fontSize: 8, color: "#556" }}>Negotiable</div>
      </div>
      {/* Specs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        {["2020", "Diesel", "Manual", "48,000 km", "Double Cab"].map((s, i) => (
          <div key={i} style={{
            padding: "2px 6px", borderRadius: 5,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 8, color: "#aab",
          }}>{s}</div>
        ))}
      </div>
      {/* WhatsApp button — pulsing */}
      <div style={{
        background: "#25D366", borderRadius: 10, padding: "9px",
        textAlign: "center", color: "#fff", fontWeight: 900, fontSize: 11,
        transform: `scale(${wpPulse})`,
        boxShadow: `0 0 ${20 * wpPulse}px rgba(37,211,102,0.6), 0 4px 16px rgba(37,211,102,0.3)`,
        cursor: "pointer",
      }}>
        💬 WhatsApp Seller
      </div>
      <div style={{
        marginTop: 6, textAlign: "center", fontSize: 8, color: "#446",
      }}>John Motors · ⭐ 4.8 · Dar es Salaam</div>
    </div>
  );
}

// Screen 3: Chat + booking confirmation
function Screen3({ frame }: { frame: number }) {
  const MESSAGES = [
    { text: "Is the Hilux still available?", sender: "buyer", frame: 0 },
    { text: "Yes! Come for test drive today 🚗", sender: "seller", frame: 25 },
    { text: "Price negotiable?", sender: "buyer", frame: 50 },
    { text: "Small discount possible ✅", sender: "seller", frame: 75 },
  ];
  const bookedOp = interpolate(frame, [95, 115], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ padding: "10px 10px", fontFamily: "Inter, sans-serif", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 10, color: "#e0f0ff", fontWeight: 800, marginBottom: 8 }}>
        💬 Chat with John Motors
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {MESSAGES.map((m, i) => {
          const msgOp = interpolate(frame, [m.frame, m.frame + 15], [0, 1], { extrapolateRight: "clamp" });
          const isBuyer = m.sender === "buyer";
          return (
            <div key={i} style={{
              opacity: msgOp,
              alignSelf: isBuyer ? "flex-start" : "flex-end",
              maxWidth: "80%",
              background: isBuyer ? "rgba(255,255,255,0.06)" : "rgba(0,153,255,0.2)",
              border: isBuyer ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,153,255,0.35)",
              borderRadius: isBuyer ? "12px 12px 12px 2px" : "12px 12px 2px 12px",
              padding: "7px 10px",
              fontSize: 10, color: "#dde",
            }}>
              {m.text}
            </div>
          );
        })}
      </div>
      {/* Booked confirmation */}
      {bookedOp > 0 && (
        <div style={{
          background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.4)",
          borderRadius: 10, padding: "8px 10px", marginTop: 8, textAlign: "center",
          opacity: bookedOp,
        }}>
          <div style={{ fontSize: 12, color: "#25D366", fontWeight: 900 }}>✅ Test Drive Booked!</div>
          <div style={{ fontSize: 8, color: "#556", marginTop: 2 }}>Tomorrow 10:00 AM · Dar es Salaam</div>
        </div>
      )}
    </div>
  );
}

export function Scene06_AppDive() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [570, 600], [1, 0], { extrapolateRight: "clamp" });

  // Phone slide-in
  const phoneSpring = spring({ frame, fps, config: { stiffness: 80, damping: 16 } });
  const phoneX = interpolate(phoneSpring, [0, 1], [350, 0]);
  const phoneOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Screen timing (600 total frames = 20s)
  // Screen 0: 0-150, Screen 1: 150-300, Screen 2: 300-480, Screen 3: 480-580
  const S0 = interpolate(frame, [10, 25, 130, 150], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const S1 = interpolate(frame, [150, 165, 280, 300], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const S2 = interpolate(frame, [300, 315, 460, 480], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const S3 = interpolate(frame, [480, 495, 570, 580], [0, 1, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Active screen for indicator dots
  const activeScreen = frame < 150 ? 0 : frame < 300 ? 1 : frame < 480 ? 2 : 3;

  // Left feature text
  const features = [
    { step: "01", title: "Browse", body: "10,000+ cars\nacross East Africa", start: 20 },
    { step: "02", title: "Compare", body: "Specs, price &\ncondition side-by-side", start: 160 },
    { step: "03", title: "Contact", body: "WhatsApp the seller\ndirectly — no middlemen", start: 310 },
    { step: "04", title: "Meet & Buy", body: "Test drive booked\nin 3 taps", start: 490 },
  ];

  const PHONE_W = 175;
  const PHONE_H = 310;

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 35% 50%, #0a1828 0%, #020508 70%)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 55,
      opacity: bgOp * fadeOut,
    }}>
      {/* Left: Feature text */}
      <div style={{ width: 240, position: "relative", height: 180 }}>
        {features.map((f, i) => {
          const op = interpolate(frame, [f.start, f.start + 18, f.start + 120, f.start + 140], [0, 1, 1, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const slideX = interpolate(frame, [f.start, f.start + 24], [-28, 0], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              position: "absolute", top: 0, left: slideX,
              opacity: op, width: "100%",
            }}>
              <div style={{ color: "rgba(0,153,255,0.55)", fontSize: 9, letterSpacing: 5, fontWeight: 700, marginBottom: 8 }}>
                STEP {f.step}
              </div>
              <div style={{ color: "#F0F4FF", fontSize: 30, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
                {f.title}
              </div>
              <div style={{ color: "#5070a0", fontSize: 13, fontFamily: "Inter, sans-serif", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {f.body}
              </div>
            </div>
          );
        })}
      </div>

      {/* Phone mockup */}
      <div style={{
        transform: `translateX(${phoneX}px)`,
        opacity: phoneOp,
        filter: "drop-shadow(0 24px 60px rgba(0,153,255,0.28))",
      }}>
        <div style={{
          position: "relative", width: PHONE_W, height: PHONE_H,
          border: "2.5px solid rgba(255,255,255,0.18)",
          borderRadius: 26,
          background: "#040810",
          boxShadow: "0 0 40px rgba(0,153,255,0.22), inset 0 0 20px rgba(0,0,0,0.8)",
          overflow: "hidden",
        }}>
          {/* Notch */}
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 55, height: 10, background: "#040810",
            borderRadius: "0 0 10px 10px", zIndex: 20,
          }} />

          {/* Screens */}
          <div style={{ position: "absolute", inset: "11px 0 0 0", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, opacity: S0 }}>
              <Screen0 frame={frame < 150 ? frame : 0} />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: S1 }}><Screen1 /></div>
            <div style={{ position: "absolute", inset: 0, opacity: S2 }}>
              <Screen2 frame={frame - 300} />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: S3 }}>
              <Screen3 frame={frame - 480} />
            </div>
          </div>

          {/* Home indicator */}
          <div style={{
            position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)",
            width: 50, height: 3, background: "rgba(255,255,255,0.25)", borderRadius: 3,
          }} />
        </div>

        {/* Screen dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10 }}>
          {[0, 1, 2, 3].map((dot) => (
            <div key={dot} style={{
              width: dot === activeScreen ? 18 : 6, height: 6,
              borderRadius: 3,
              background: dot === activeScreen ? "#0099FF" : "rgba(255,255,255,0.15)",
              boxShadow: dot === activeScreen ? "0 0 8px #0099FF" : "none",
              transition: "width 0.3s, background 0.3s",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
