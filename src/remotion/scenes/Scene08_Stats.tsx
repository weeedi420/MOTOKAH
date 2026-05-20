import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, EASE } from "../design";
import { BigNumber } from "../components/BigNumber";

export function Scene08_Stats() {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [100, 110], [1, 0], { extrapolateRight: "clamp" });

  const captionOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp", easing: EASE });

  // Stagger the entire stat cards (number + label together) - FASTER
  const statCards = [
    { from: 0, to: 10000, suffix: "+", label: "Verified Listings", startFrame: 12, durationFrames: 30, delay: 0 },
    { from: 0, to: 5, label: "Countries", startFrame: 20, durationFrames: 24, delay: 8 },
    { to: "Free", label: "To List & Browse", startFrame: 28, delay: 16 },
  ];

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: COLOR.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: fadeOut,
    }}>
      {/* Section caption */}
      <div style={{
        fontSize: 11, fontWeight: 500, color: COLOR.inkMute,
        fontFamily: "Inter, sans-serif",
        letterSpacing: "0.12em", textTransform: "uppercase",
        marginBottom: 64,
        opacity: captionOp,
      }}>
        Motokah by the numbers
      </div>

      {/* Numbers row */}
      <div style={{ display: "flex", gap: 96, alignItems: "flex-start" }}>
        {statCards.map((stat, i) => {
          const f = frame - stat.delay;
          const cardOp = interpolate(f, [0, 16], [0, 1], { extrapolateRight: "clamp", easing: EASE });
          const cardY = interpolate(f, [0, 16], [14, 0], { extrapolateRight: "clamp", easing: EASE });

          return (
            <div key={i} style={{
              opacity: cardOp,
              transform: `translateY(${cardY}px)`,
            }}>
              {typeof stat.to === "string" ? (
                <BigNumber
                  to={stat.to}
                  label={stat.label}
                  startFrame={stat.startFrame}
                />
              ) : (
                <BigNumber
                  from={stat.from}
                  to={stat.to}
                  suffix={stat.suffix || ""}
                  label={stat.label}
                  startFrame={stat.startFrame}
                  durationFrames={stat.durationFrames}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
