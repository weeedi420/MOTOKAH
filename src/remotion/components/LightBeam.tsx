import { interpolate, useCurrentFrame } from "../frame";

interface LightBeamProps {
  /** headlight tip position in viewBox coords */
  x: number;
  y: number;
  /** length of the beam cone */
  length?: number;
  /** vertical spread angle in degrees */
  spread?: number;
  opacity?: number;
  color?: string;
  pulse?: boolean;
}

export function LightBeam({
  x, y,
  length = 220,
  spread = 28,
  opacity = 0.55,
  color = "#fffce0",
  pulse = true,
}: LightBeamProps) {
  const frame = useCurrentFrame();

  const pulseOp = pulse
    ? opacity * (1 + 0.08 * Math.sin((frame / 30) * Math.PI * 2))
    : opacity;

  const halfSpread = spread / 2;
  const dy = Math.tan((halfSpread * Math.PI) / 180) * length;

  const id = `beam-${x}-${y}`;

  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0%" cy="50%" r="100%" fx="0%" fy="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.9} />
          <stop offset="40%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <polygon
        points={`${x},${y - 3} ${x},${y + 3} ${x + length},${y + dy} ${x + length},${y - dy}`}
        fill={`url(#${id})`}
        opacity={pulseOp}
      />
    </g>
  );
}
