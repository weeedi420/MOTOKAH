import { useCurrentFrame } from "../frame";

interface CarSVGProps {
  scale?: number;
  color?: string;
  motionBlur?: number;
  headlightsOn?: boolean;
  wheelSpeed?: number;
  showUnderglow?: boolean;
}

export function CarSVG({
  scale = 1,
  color = "#0099FF",
  motionBlur = 0,
  headlightsOn = true,
  wheelSpeed = 10,
  showUnderglow = true,
}: CarSVGProps) {
  const frame = useCurrentFrame();
  const wheelAngle = frame * wheelSpeed;

  const W = 300;
  const H = 110;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W * scale}
      height={H * scale}
      style={{
        filter: motionBlur > 0.2 ? `blur(${motionBlur}px)` : undefined,
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id="cBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e2d3e" />
          <stop offset="45%" stopColor="#0d1c2a" />
          <stop offset="100%" stopColor="#050e16" />
        </linearGradient>
        <radialGradient id="cUnder" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.55} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="cHL" cx="0%" cy="50%" r="100%">
          <stop offset="0%" stopColor="#ffffee" stopOpacity={0.9} />
          <stop offset="50%" stopColor="#ffffc0" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#ffffa0" stopOpacity={0} />
        </radialGradient>
        <filter id="cGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Underglow */}
      {showUnderglow && (
        <ellipse cx={150} cy={98} rx={115} ry={12} fill="url(#cUnder)" />
      )}

      {/* Headlight beam cone */}
      {headlightsOn && (
        <polygon
          points="270,52 300,14 300,90"
          fill="url(#cHL)"
          opacity={0.55}
        />
      )}

      {/* Shadow */}
      <ellipse cx={150} cy={94} rx={108} ry={5} fill="rgba(0,0,0,0.5)" />

      {/* Lower body / chassis */}
      <path
        d="M 28 84 L 28 70 L 42 66 L 56 64 L 65 50 L 80 40 L 108 34 L 188 32 L 218 36 L 238 46 L 258 54 L 272 64 L 278 70 L 278 84 Z"
        fill="url(#cBodyGrad)"
        stroke={color}
        strokeWidth={1.5}
        filter="url(#cGlow)"
      />

      {/* Cabin */}
      <path
        d="M 80 66 L 90 42 L 115 34 L 190 32 L 218 36 L 235 50 L 235 66 Z"
        fill="#06101a"
        stroke={color}
        strokeWidth={1}
      />

      {/* Windshield */}
      <path d="M 105 64 L 116 42 L 162 34 L 162 64 Z"
        fill="rgba(0,200,255,0.14)" stroke="rgba(0,210,255,0.45)" strokeWidth={1} />

      {/* Rear window */}
      <path d="M 167 64 L 167 34 L 190 32 L 218 36 L 225 50 L 225 64 Z"
        fill="rgba(0,180,255,0.10)" stroke="rgba(0,190,255,0.35)" strokeWidth={1} />

      {/* Side window strip */}
      <rect x={107} y={44} width={54} height={16} rx={2}
        fill="rgba(0,170,255,0.08)" stroke="rgba(0,180,255,0.3)" strokeWidth={0.8} />

      {/* Door seams */}
      <line x1={163} y1={40} x2={163} y2={84} stroke={color} strokeWidth={0.6} opacity={0.35} />
      <line x1={106} y1={64} x2={106} y2={84} stroke={color} strokeWidth={0.6} opacity={0.3} />

      {/* Hood accent line */}
      <path d="M 235 50 L 258 54" stroke="rgba(0,153,255,0.4)" strokeWidth={1} />

      {/* Fender arches */}
      <path d="M 218 84 Q 238 70 258 84" fill="none" stroke={color} strokeWidth={1.5} />
      <path d="M 52 84 Q 72 70 92 84" fill="none" stroke={color} strokeWidth={1.5} />

      {/* Front bumper */}
      <path d="M 272 64 L 280 68 L 282 76 L 278 82 L 278 84 L 268 84"
        fill="#080e14" stroke={color} strokeWidth={1.2} />

      {/* Rear bumper */}
      <path d="M 28 70 L 20 72 L 18 78 L 22 84 L 28 84"
        fill="#080e14" stroke={color} strokeWidth={1.2} />

      {/* Exhaust pipe */}
      <ellipse cx={23} cy={82} rx={4} ry={2.5} fill="#0a0a0a" stroke="rgba(150,120,60,0.5)" strokeWidth={1} />

      {/* Headlight cluster */}
      <ellipse cx={270} cy={54} rx={7} ry={4.5}
        fill={headlightsOn ? "#ffffcc" : "#1a2a36"}
        style={headlightsOn ? { filter: "drop-shadow(0 0 8px #ffffaa)" } : {}} />
      {/* DRL strip */}
      <rect x={264} y={60} width={12} height={2.5} rx={1.2}
        fill={headlightsOn ? "#aaeeff" : "#1a2a36"}
        style={headlightsOn ? { filter: "drop-shadow(0 0 5px #88ddff)" } : {}} />

      {/* Tail lights */}
      <rect x={19} y={57} width={9} height={13} rx={2}
        fill="#cc0808"
        style={{ filter: "drop-shadow(0 0 7px #ff1111)" }} />
      <line x1={21} y1={57} x2={21} y2={70} stroke="#ff4444" strokeWidth={1.5}
        style={{ filter: "drop-shadow(0 0 3px #ff3333)" }} />

      {/* Body side stripe */}
      <line x1={30} y1={74} x2={278} y2={74} stroke={color} strokeWidth={0.5} opacity={0.22} />

      {/* ── Front wheel ── */}
      <circle cx={238} cy={84} r={18} fill="#060c12" stroke={color} strokeWidth={2} />
      <circle cx={238} cy={84} r={13} fill="#040a10" stroke="rgba(0,153,255,0.25)" strokeWidth={1} />
      <g transform={`translate(238 84) rotate(${wheelAngle})`}>
        {[0, 72, 144, 216, 288].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line key={a}
              x1={Math.cos(rad) * 3} y1={Math.sin(rad) * 3}
              x2={Math.cos(rad) * 11} y2={Math.sin(rad) * 11}
              stroke={color} strokeWidth={2.5} strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle cx={238} cy={84} r={4} fill={color}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }} />

      {/* ── Rear wheel ── */}
      <circle cx={72} cy={84} r={18} fill="#060c12" stroke={color} strokeWidth={2} />
      <circle cx={72} cy={84} r={13} fill="#040a10" stroke="rgba(0,153,255,0.25)" strokeWidth={1} />
      <g transform={`translate(72 84) rotate(${wheelAngle})`}>
        {[0, 72, 144, 216, 288].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line key={a}
              x1={Math.cos(rad) * 3} y1={Math.sin(rad) * 3}
              x2={Math.cos(rad) * 11} y2={Math.sin(rad) * 11}
              stroke={color} strokeWidth={2.5} strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle cx={72} cy={84} r={4} fill={color}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
    </svg>
  );
}
