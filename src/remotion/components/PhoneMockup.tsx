import { interpolate, useCurrentFrame } from "../frame";

// App screen definitions
function Screen1() {
  return (
    <div style={{ padding: "12px 10px", fontFamily: "Inter, sans-serif" }}>
      {/* Search bar */}
      <div style={{
        background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px",
        color: "#aac", fontSize: 11, marginBottom: 10, border: "1px solid rgba(0,153,255,0.3)"
      }}>
        🔍 Toyota Hilux Tanzania...
      </div>
      {/* Listing cards */}
      {[
        { title: "Toyota Hilux D-Cab 2020", price: "45M TZS", loc: "Dar es Salaam", badge: "New" },
        { title: "Land Cruiser Prado 2019", price: "120M TZS", loc: "Arusha", badge: "" },
      ].map((c, i) => (
        <div key={i} style={{
          background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px",
          marginBottom: 8, border: "1px solid rgba(255,255,255,0.08)"
        }}>
          <div style={{
            height: 52, background: "linear-gradient(135deg,#1a2a3a,#0a1520)",
            borderRadius: 6, marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontSize: 22 }}>🚙</span>
          </div>
          <div style={{ fontSize: 10, color: "#e0f0ff", fontWeight: 700, marginBottom: 2 }}>{c.title}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#0099FF", fontWeight: 800 }}>{c.price}</span>
            <span style={{ fontSize: 9, color: "#aab", }}>📍 {c.loc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Screen2() {
  return (
    <div style={{ padding: "12px 10px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ color: "#e0f0ff", fontSize: 12, fontWeight: 800, marginBottom: 8 }}>Toyota Hilux 2020</div>
      <div style={{
        height: 90, background: "linear-gradient(135deg,#0d1f2d,#0a1a28)",
        borderRadius: 8, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: 40 }}>🚙</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {["45M TZS", "2020", "Manual", "Diesel"].map((tag, i) => (
          <div key={i} style={{
            background: i === 0 ? "rgba(0,153,255,0.25)" : "rgba(255,255,255,0.07)",
            border: i === 0 ? "1px solid #0099FF" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6, padding: "3px 6px", fontSize: 9, color: i === 0 ? "#0099FF" : "#ccc",
            fontWeight: 700
          }}>{tag}</div>
        ))}
      </div>
      <div style={{ color: "#aab", fontSize: 9, marginBottom: 10 }}>📍 Dar es Salaam · John Motors</div>
      {/* WhatsApp button */}
      <div style={{
        background: "#25D366", borderRadius: 8, padding: "9px",
        textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 11,
        boxShadow: "0 0 16px rgba(37,211,102,0.5)"
      }}>
        💬 WhatsApp Seller
      </div>
    </div>
  );
}

function Screen3() {
  return (
    <div style={{ padding: "12px 10px", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ color: "#e0f0ff", fontSize: 11, fontWeight: 800, marginBottom: 8 }}>💬 Chat with John Motors</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          background: "rgba(255,255,255,0.06)", borderRadius: "12px 12px 12px 2px",
          padding: "7px 10px", color: "#dde", fontSize: 10, maxWidth: "80%"
        }}>Hi, is the Hilux still available?</div>
        <div style={{
          background: "rgba(0,153,255,0.2)", border: "1px solid rgba(0,153,255,0.3)",
          borderRadius: "12px 12px 2px 12px", padding: "7px 10px", color: "#e0f0ff",
          fontSize: 10, alignSelf: "flex-end", maxWidth: "80%"
        }}>Yes, come for test drive today! 🚗</div>
        <div style={{
          background: "rgba(255,255,255,0.06)", borderRadius: "12px 12px 12px 2px",
          padding: "7px 10px", color: "#dde", fontSize: 10, maxWidth: "80%"
        }}>Price negotiable?</div>
        <div style={{
          background: "rgba(0,153,255,0.2)", border: "1px solid rgba(0,153,255,0.3)",
          borderRadius: "12px 12px 2px 12px", padding: "7px 10px", color: "#e0f0ff",
          fontSize: 10, alignSelf: "flex-end", maxWidth: "80%"
        }}>Small discount possible ✅</div>
      </div>
    </div>
  );
}

export function PhoneMockup({ startFrame = 0 }: { startFrame?: number }) {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  // Screen transitions: 0-80 screen1, 80-160 screen2, 160-240 screen3
  const s1 = interpolate(elapsed, [0, 15, 70, 85], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s2 = interpolate(elapsed, [80, 95, 150, 165], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s3 = interpolate(elapsed, [160, 175, 235, 240], [0, 1, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const PHONE_W = 170;
  const PHONE_H = 300;

  return (
    <div style={{ position: "relative", width: PHONE_W, height: PHONE_H }}>
      {/* Phone frame */}
      <div style={{
        position: "absolute", inset: 0,
        border: "3px solid rgba(255,255,255,0.2)",
        borderRadius: 24,
        background: "#05080e",
        boxShadow: "0 0 40px rgba(0,153,255,0.25), inset 0 0 20px rgba(0,0,0,0.8)",
        overflow: "hidden",
      }}>
        {/* Notch */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 60, height: 10, background: "#05080e", borderRadius: "0 0 10px 10px", zIndex: 10,
        }} />
        {/* Screen content */}
        <div style={{ position: "absolute", inset: "12px 0 0 0", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: s1 }}><Screen1 /></div>
          <div style={{ position: "absolute", inset: 0, opacity: s2 }}><Screen2 /></div>
          <div style={{ position: "absolute", inset: 0, opacity: s3 }}><Screen3 /></div>
        </div>
        {/* Status bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 12,
          background: "linear-gradient(#05080e, transparent)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "2px 12px", fontSize: 7, color: "#99aabb", zIndex: 5,
        }}>
          <span>9:41</span><span>●●●</span>
        </div>
      </div>
      {/* Tap ripple effect */}
      {elapsed > 60 && elapsed < 90 && (
        <div style={{
          position: "absolute", left: "50%", top: "55%",
          width: interpolate(elapsed, [60, 90], [0, 50]),
          height: interpolate(elapsed, [60, 90], [0, 50]),
          transform: "translate(-50%,-50%)",
          border: "2px solid rgba(0,153,255,0.6)",
          borderRadius: "50%",
          opacity: interpolate(elapsed, [60, 90], [0.8, 0]),
        }} />
      )}
    </div>
  );
}
