import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, EASE, RADIUS, SHADOW } from "../design";

const PROBLEMS = [
  { label: "WhatsApp groups." },
  { label: "Random listings." },
  { label: "Vague prices." },
];

export function Scene02_Problem() {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [120, 130], [1, 0], { extrapolateRight: "clamp" });

  // Cards slide up staggered - FASTER
  const cardAnims = PROBLEMS.map((_, i) => ({
    op: interpolate(frame, [i * 4, i * 4 + 12], [0, 1], { extrapolateRight: "clamp", easing: EASE }),
    y:  interpolate(frame, [i * 4, i * 4 + 12], [20, 0], { extrapolateRight: "clamp", easing: EASE }),
  }));

  // Strike-through lines draw - FASTER
  const strikeAnims = PROBLEMS.map((_, i) => ({
    offset: interpolate(frame, [45 + i * 4, 58 + i * 4], [280, 0], { extrapolateRight: "clamp", easing: EASE }),
    op: interpolate(frame, [45 + i * 4, 50 + i * 4], [0, 1], { extrapolateRight: "clamp" }),
  }));

  // Cards desaturate + dim after strikes - FASTER
  const cardDim = interpolate(frame, [70, 85], [1, 0.35], { extrapolateRight: "clamp" });

  // Closing line - FASTER
  const closeOp = interpolate(frame, [80, 95], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const closeY  = interpolate(frame, [80, 95], [10, 0], { extrapolateRight: "clamp", easing: EASE });

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: COLOR.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: fadeOut,
    }}>
      {/* Cards row */}
      <div style={{ display: "flex", gap: 20, opacity: cardDim }}>
        {PROBLEMS.map((p, i) => (
          <div key={i} style={{
            width: 210, height: 140,
            background: COLOR.bg,
            borderRadius: RADIUS.lg,
            border: `1px solid ${COLOR.border}`,
            boxShadow: SHADOW.card,
            padding: 20,
            position: "relative",
            opacity: cardAnims[i].op,
            transform: `translateY(${cardAnims[i].y}px)`,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div style={{
              fontSize: 8, fontWeight: 700, color: COLOR.inkMute,
              fontFamily: "Inter, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              Before
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700, color: COLOR.ink,
              fontFamily: "Inter, system-ui, sans-serif",
              lineHeight: 1.2, letterSpacing: "-0.02em",
            }}>
              {p.label}
            </div>

            {/* Strike-through — THICKER */}
            <svg
              style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
              width={210} height={140}
            >
              <line
                x1={10} y1={10} x2={200} y2={130}
                stroke={COLOR.ink} strokeWidth={3.5} strokeLinecap="round"
                strokeDasharray={280}
                strokeDashoffset={strikeAnims[i].offset}
                opacity={strikeAnims[i].op}
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Closing line */}
      <div style={{
        marginTop: 44,
        fontSize: 22,
        fontWeight: 500,
        fontFamily: "Inter, sans-serif",
        color: COLOR.inkSoft,
        opacity: closeOp,
        transform: `translateY(${closeY}px)`,
        letterSpacing: "-0.01em",
      }}>
        There's a better way.
      </div>
    </div>
  );
}
