import { interpolate, spring, useCurrentFrame, useVideoConfig } from "../frame";

// Simplified Africa outline path (viewBox 0 0 400 480)
const AFRICA_PATH =
  "M 155 28 L 185 18 L 215 22 L 248 30 L 272 48 L 290 72 L 302 98 L 308 120 " +
  "L 320 142 L 340 158 L 348 178 L 342 200 L 332 222 L 324 250 L 318 278 " +
  "L 310 305 L 298 332 L 282 358 L 265 380 L 248 400 L 232 415 L 215 422 " +
  "L 200 422 L 185 415 L 170 400 L 155 378 L 140 352 L 128 322 L 120 292 " +
  "L 115 262 L 112 232 L 108 205 L 102 180 L 95 158 L 88 138 L 82 118 " +
  "L 80 96 L 88 74 L 100 56 L 120 40 L 140 30 Z";

const PINS = [
  { name: "Tanzania", flag: "🇹🇿", cx: 258, cy: 310, delay: 0 },
  { name: "Kenya", flag: "🇰🇪", cx: 278, cy: 285, delay: 6 },
  { name: "Uganda", flag: "🇺🇬", cx: 242, cy: 278, delay: 12 },
  { name: "Rwanda", flag: "🇷🇼", cx: 235, cy: 292, delay: 18 },
  { name: "Nigeria", flag: "🇳🇬", cx: 138, cy: 238, delay: 24 },
  { name: "Ethiopia", flag: "🇪🇹", cx: 295, cy: 245, delay: 30 },
  { name: "Burundi", flag: "🇧🇮", cx: 238, cy: 300, delay: 36 },
];

export function AfricaMap({ startFrame = 0 }: { startFrame?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;

  const pathLen = 1800;
  const strokeDraw = interpolate(elapsed, [0, 60], [pathLen, 0], { extrapolateRight: "clamp" });
  const mapOpacity = interpolate(elapsed, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const glowOpacity = interpolate(elapsed, [40, 80], [0, 0.6], { extrapolateRight: "clamp" });

  return (
    <div style={{ position: "relative", width: 340, height: 380 }}>
      <svg viewBox="0 0 400 480" width={340} height={380} style={{ overflow: "visible" }}>
        {/* Glow layer */}
        <path
          d={AFRICA_PATH}
          fill="none"
          stroke="#0099FF"
          strokeWidth={8}
          opacity={glowOpacity}
          style={{ filter: "blur(8px)" }}
        />
        {/* Main outline */}
        <path
          d={AFRICA_PATH}
          fill="rgba(0,153,255,0.06)"
          stroke="#0099FF"
          strokeWidth={2}
          opacity={mapOpacity}
          strokeDasharray={pathLen}
          strokeDashoffset={strokeDraw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Pins */}
        {PINS.map((pin) => {
          const pinFrame = elapsed - pin.delay;
          const sc = spring({ frame: pinFrame, fps, config: { stiffness: 200, damping: 14 } });
          const pulse = 1 + 0.15 * Math.sin((elapsed / fps) * Math.PI * 2);
          if (pinFrame < 0) return null;
          return (
            <g key={pin.name} transform={`translate(${pin.cx},${pin.cy})`} style={{ transformOrigin: `${pin.cx}px ${pin.cy}px` }}>
              <circle r={12 * pulse} fill="rgba(0,153,255,0.15)" />
              <circle r={6} fill="#0099FF" style={{ filter: "drop-shadow(0 0 6px #0099FF)" }} transform={`scale(${sc})`} />
              <text
                x={14}
                y={4}
                fontSize={9}
                fill="#e0f0ff"
                fontFamily="Inter, sans-serif"
                fontWeight={600}
                opacity={interpolate(pinFrame, [0, 20], [0, 1], { extrapolateRight: "clamp" })}
              >
                {pin.flag} {pin.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
