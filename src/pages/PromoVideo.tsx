import { useState } from "react";
import { Player } from "@remotion/player";
import { MotokahPromo } from "@/remotion/Main";
import { MotokahSaaSMotionAd } from "@/remotion/PremiumAd";
import { TIMING, FPS } from "@/remotion/timing";

const W = 1280;
const H = 720;

const ADS = [
  {
    id: "cinematic",
    label: "Cinematic Ad",
    component: MotokahPromo,
    duration: TIMING.totalDuration,
    description: "9 scenes · dark + golden amber · voiceover synced",
  },
  {
    id: "premium",
    label: "Premium Motion Ad",
    component: MotokahSaaSMotionAd,
    duration: 210,
    description: "7s · orbiting nodes · spring physics · interface reveal",
  },
];

export default function PromoVideo() {
  const [active, setActive] = useState("premium");
  const current = ADS.find((a) => a.id === active) || ADS[1];

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
          {current.label}
        </div>
      </div>

      {/* Ad Selector */}
      <div style={{
        display: "flex",
        gap: 8,
        marginBottom: 20,
      }}>
        {ADS.map((ad) => (
          <button
            key={ad.id}
            onClick={() => setActive(ad.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: active === ad.id ? "#0066CC" : "#2A2A35",
              background: active === ad.id ? "rgba(0, 102, 204, 0.15)" : "transparent",
              color: active === ad.id ? "#0066CC" : "#6B6678",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {ad.label}
          </button>
        ))}
      </div>

      {/* Player */}
      <div style={{
        width: "100%", maxWidth: 960,
        borderRadius: 16, overflow: "hidden",
        boxShadow: "0 0 80px rgba(0,102,204,0.1), 0 40px 80px rgba(0,0,0,0.5)",
        border: "1px solid rgba(0,102,204,0.15)",
      }}>
        <Player
          key={active}
          component={current.component}
          durationInFrames={current.duration}
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
        <span>{Math.round(current.duration / FPS)}s · {FPS}fps · {W}×{H}</span>
        <span>{current.description}</span>
        <span>
          Export: <code style={{ background: "#1A1A24", padding: "1px 5px", borderRadius: 4, border: "1px solid #2A2A35", color: "#B8B4C8" }}>
            npx remotion studio
          </code>
        </span>
      </div>
    </div>
  );
}
