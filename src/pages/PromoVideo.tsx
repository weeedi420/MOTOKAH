import { Player } from "@remotion/player";
import { MotokahPromo } from "@/remotion/Main";
import { TIMING, FPS } from "@/remotion/timing";

const TOTAL = TIMING.totalDuration;
const W = 1280;
const H = 720;

export default function PromoVideo() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 16px",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: "#6B6678",
          letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8,
        }}>
          Motokah · Product Film
        </div>
        <div style={{
          fontSize: 24, fontWeight: 700, color: "#FFFFFF",
          letterSpacing: "-0.025em",
        }}>
          Cinematic Ad
        </div>
      </div>

      {/* Player */}
      <div style={{
        width: "100%", maxWidth: 960,
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 0 80px rgba(245,166,35,0.1), 0 40px 80px rgba(0,0,0,0.5)",
        border: "1px solid rgba(245,166,35,0.1)",
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
        justifyContent: "center", color: "#6B6678", fontSize: 11,
      }}>
        <span>{Math.round(TOTAL / FPS)}s · {FPS}fps · {W}×{H}</span>
        <span>9 scenes · dark + golden amber</span>
        <span>
          Export: <code style={{ background: "#1A1A24", padding: "1px 5px", borderRadius: 4, border: "1px solid #2A2A35", color: "#B8B4C8" }}>
            npx remotion studio
          </code>
        </span>
      </div>
    </div>
  );
}
