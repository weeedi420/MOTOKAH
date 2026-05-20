import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, EASE } from "../design";

interface BigNumberProps {
  to: number | string;
  from?: number;
  label: string;
  suffix?: string;
  startFrame: number;
  durationFrames?: number;
  style?: React.CSSProperties;
}

export function BigNumber({
  to,
  from = 0,
  label,
  suffix = "",
  startFrame,
  durationFrames = 36,
  style,
}: BigNumberProps) {
  const frame = useCurrentFrame();
  const f = frame - startFrame;

  let displayValue: string;
  if (typeof to === "string") {
    const revealT = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    displayValue = revealT > 0.5 ? to : "";
  } else {
    const t = interpolate(f, [0, durationFrames], [0, 1], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
      easing: EASE.outExpo,
    });
    const current = Math.round(from + (to - from) * t);
    displayValue = current.toLocaleString();
  }

  const opacity = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp", easing: EASE.outExpo });
  const translateY = interpolate(f, [0, 18], [16, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp", easing: EASE.outExpo });

  if (f < 0) return null;

  return (
    <div style={{
      textAlign: "center",
      opacity,
      transform: `translateY(${translateY}px)`,
      ...style,
    }}>
      <div style={{
        fontSize: 80,
        fontWeight: 700,
        color: COLOR.ink,
        fontFamily: "Inter, system-ui, sans-serif",
        lineHeight: 1,
        letterSpacing: "-0.03em",
      }}>
        {displayValue}{suffix}
      </div>
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        color: COLOR.inkSoft,
        fontFamily: "Inter, sans-serif",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginTop: 10,
      }}>
        {label}
      </div>
    </div>
  );
}
