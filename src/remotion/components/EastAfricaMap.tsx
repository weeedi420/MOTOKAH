import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, EASE, SPRING } from "../design";

// Projection: x = (lon − 28) * 21,  y = (12 − lat) * 21
// ViewBox: 0 0 520 588  →  28°E–52.8°E, 12°N–16°S
// Paths based on Natural Earth simplified outlines

interface Country {
  id: string;
  d: string;
  name: string;
  active: boolean;
  pin?: [number, number];
  labelAt?: [number, number];
}

const COUNTRIES: Country[] = [
  // ── ACTIVE MARKETS ──────────────────────────────────────────────────
  {
    id: "TZ", name: "Tanzania", active: true,
    pin: [237, 396], labelAt: [148, 430],
    // Real outline: Lake Victoria NW → NE coast → SE → S → SW → W Lake Tanganyika → back
    d: `M 126 273
        L 204 254
        L 231 284
        L 257 354
        L 237 396
        L 259 472
        L 220 495
        L 147 495
        L 68 495
        L 31 433
        L 31 357
        L 31 304
        L 59 273
        Z`,
  },
  {
    id: "KE", name: "Kenya", active: true,
    pin: [184, 278], labelAt: [210, 240],
    // Real outline: triangular with NE horn toward Somalia
    d: `M 126 246
        L 147 164
        L 210 176
        L 292 176
        L 283 296
        L 254 336
        L 231 284
        L 204 254
        L 126 273
        Z`,
  },
  {
    id: "UG", name: "Uganda", active: true,
    pin: [96, 245], labelAt: [76, 222],
    d: `M 52 178
        L 126 176
        L 126 256
        L 59 273
        L 34 256
        L 34 210
        Z`,
  },
  {
    id: "RW", name: "Rwanda", active: true,
    pin: [44, 290], labelAt: [28, 283],
    d: `M 21 275 L 60 275 L 60 308 L 21 308 Z`,
  },
  {
    id: "BI", name: "Burundi", active: true,
    pin: [29, 322], labelAt: [28, 342],
    d: `M 21 308 L 59 308 L 59 349 L 21 349 Z`,
  },

  // ── CONTEXT COUNTRIES (inactive) ────────────────────────────────────
  {
    id: "SS", name: "S. Sudan", active: false,
    // Eastern S. Sudan only (28-36°E, 4-12°N)
    d: `M 0 0 L 168 0 L 168 189 L 63 189 L 42 210 L 0 210 Z`,
  },
  {
    id: "ET", name: "Ethiopia", active: false,
    // Real shape: west flat, SE point toward Kenya, NE toward Horn
    d: `M 105 0
        L 105 147
        L 147 168
        L 210 176
        L 292 176
        L 336 147
        L 378 21
        L 315 0
        Z`,
  },
  {
    id: "SO", name: "Somalia", active: false,
    // Horn of Africa — L-shape going NE then south
    d: `M 292 176
        L 336 8
        L 492 33
        L 294 210
        L 283 296
        Z`,
  },
  {
    id: "CD", name: "DRC", active: false,
    // Only eastern strip visible (28-30°E)
    d: `M 0 147 L 42 147 L 42 504 L 0 504 Z`,
  },
  {
    id: "ZM", name: "Zambia", active: false,
    // Northern Zambia only
    d: `M 0 420 L 105 420 L 105 588 L 0 588 Z`,
  },
  {
    id: "MW", name: "Malawi", active: false,
    // Narrow lake country
    d: `M 98 462 L 145 462 L 140 588 L 98 588 Z`,
  },
  {
    id: "MZ", name: "Mozambique", active: false,
    // Northern Mozambique
    d: `M 105 462 L 252 462 L 252 588 L 105 588 Z`,
  },
];

const ACTIVE   = COUNTRIES.filter((c) => c.active);
const INACTIVE = COUNTRIES.filter((c) => !c.active);
const PATH_DASH = 1600;

interface EastAfricaMapProps {
  startFrame?: number;
  width?: number;
  height?: number;
  showLabels?: boolean;
}

export function EastAfricaMap({
  startFrame = 0,
  width = 340,
  height = 380,
  showLabels = true,
}: EastAfricaMapProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - startFrame;

  const inactiveOp = interpolate(f, [0, 20], [0, 0.8], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp", easing: EASE.outExpo,
  });

  return (
    <svg viewBox="0 0 520 588" width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="mapShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={COLOR.ink} floodOpacity="0.06" />
        </filter>
      </defs>

      {/* Inactive context countries */}
      {INACTIVE.map((c) => (
        <path
          key={c.id}
          d={c.d}
          fill="#F0F2F5"
          stroke="#D1D5DB"
          strokeWidth={0.8}
          opacity={inactiveOp}
        />
      ))}

      {/* Active countries — stroke-draw animation + fill */}
      {ACTIVE.map((c, i) => {
        const start = i * 10;
        const strokeOffset = interpolate(f, [start, start + 35], [PATH_DASH, 0], {
          extrapolateRight: "clamp", extrapolateLeft: "clamp",
        });
        const fillOp = interpolate(f, [start + 12, start + 35], [0, 0.22], {
          extrapolateRight: "clamp", extrapolateLeft: "clamp",
        });

        return (
          <g key={c.id} filter="url(#mapShadow)">
            <path
              d={c.d}
              fill={COLOR.brand}
              fillOpacity={fillOp}
              stroke={COLOR.brand}
              strokeWidth={1.8}
              strokeDasharray={PATH_DASH}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* City pins */}
      {ACTIVE.filter((c) => c.pin).map((c, i) => {
        const delay = i * 10 + 40;
        const s = spring({ frame: f - delay, fps, config: SPRING.main });
        const op = interpolate(f - delay, [0, 12], [0, 1], {
          extrapolateRight: "clamp", extrapolateLeft: "clamp",
        });
        const pulse = 1 + 0.1 * Math.sin((f / fps) * Math.PI * 2 + i * 1.1);
        const [px, py] = c.pin!;

        return (
          <g key={c.id + "-pin"} opacity={op}>
            {/* Pulse ring */}
            <circle cx={px} cy={py} r={12 * pulse} fill={COLOR.brand} opacity={0.12} />
            {/* Pin dot */}
            <circle cx={px} cy={py} r={5.5 * s} fill={COLOR.brand} filter="url(#pinGlow)" />
            <circle cx={px} cy={py} r={2.5 * s} fill="#fff" />

            {showLabels && c.labelAt && (
              <text
                x={c.labelAt[0]}
                y={c.labelAt[1]}
                fontSize={10}
                fontWeight={700}
                fontFamily="Inter, system-ui"
                fill={COLOR.brandInk}
                textAnchor="middle"
                opacity={interpolate(f - delay, [10, 24], [0, 1], { extrapolateRight: "clamp" })}
              >
                {c.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
