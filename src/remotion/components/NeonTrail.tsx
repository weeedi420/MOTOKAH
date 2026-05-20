import { useCurrentFrame, interpolate } from "../frame";

interface NeonTrailProps {
  cx: number;
  cy: number;
  radius: number;
  totalFrames?: number;
  color?: string;
  trailLength?: number; // radians of trail behind car
}

export function NeonTrail({
  cx, cy, radius,
  totalFrames = 240,
  color = "#0099FF",
  trailLength = Math.PI * 0.8,
}: NeonTrailProps) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, totalFrames], [0, 1], { extrapolateRight: "clamp" });
  const currentAngle = -Math.PI / 2 + progress * Math.PI * 2;
  const N = 50;

  return (
    <g>
      {Array.from({ length: N }, (_, i) => {
        const t = i / (N - 1);
        const trailAngle = currentAngle - t * trailLength;
        // Only render if this point has been "traveled"
        const pointProgress = (trailAngle + Math.PI / 2) / (Math.PI * 2);
        if (pointProgress < 0 || pointProgress > progress) return null;

        const x = cx + Math.cos(trailAngle) * radius;
        const y = cy + Math.sin(trailAngle) * radius;
        const opacity = Math.pow(1 - t, 0.6) * 0.95;
        const r = (1 - t * 0.7) * 5;

        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill={color}
            opacity={opacity}
            style={{ filter: `drop-shadow(0 0 ${r * 2}px ${color})` }}
          />
        );
      })}
    </g>
  );
}
