import { Player } from "@remotion/player";
import { MotokahPromo } from "@/remotion/Main";

const TOTAL = 1512; // 50.4s @ 30fps (synced to voiceover)
const FPS = 30;
const W = 1280;
const H = 720;

export default function PromoVideo() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8F9FB",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 16px",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: "#9AA2B1",
          letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8,
        }}>
          Motokah · Product Film
        </div>
        <div style={{
          fontSize: 24, fontWeight: 700, color: "#0A0F1E",
          letterSpacing: "-0.025em",
        }}>
          50-Second Ad
        </div>
      </div>

      {/* Player */}
      <div style={{
        width: "100%", maxWidth: 960,
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 4px 12px rgba(10,15,30,0.06), 0 24px 48px rgba(10,15,30,0.10)",
        border: "1px solid #E5E7EB",
      }}>
        <Player
          component={MotokahPromo}
          durationInFrames={TOTAL}
          compositionWidth={W}
          compositionHeight={H}
          fps={FPS}
          controls
          loop
          style={{ width: "100%", display: "block" }}
          inputProps={{}}
          acknowledgeRemotionLicense
        />
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 16, display: "flex", flexWrap: "wrap", gap: 20,
        justifyContent: "center", color: "#9AA2B1", fontSize: 11,
      }}>
        <span>50s · 30fps · 1280×720</span>
        <span>9 scenes · white + blue</span>
        <span>
          Export: <code style={{ background: "#fff", padding: "1px 5px", borderRadius: 4, border: "1px solid #E5E7EB" }}>
            npx remotion studio
          </code>
        </span>
      </div>
    </div>
  );
}
