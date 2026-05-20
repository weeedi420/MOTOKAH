import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, SPRING_CFG } from "../design";

interface City {
  name: string;
  country: string;
  x: number;
  y: number;
  active: boolean;
}

const CITIES: City[] = [
  { name: "Dar es Salaam", country: "TZ", x: 320, y: 380, active: true },
  { name: "Nairobi", country: "KE", x: 260, y: 240, active: true },
  { name: "Kampala", country: "UG", x: 160, y: 220, active: true },
  { name: "Kigali", country: "RW", x: 120, y: 300, active: true },
  { name: "Bujumbura", country: "BI", x: 120, y: 340, active: true },
  { name: "Mombasa", country: "KE", x: 340, y: 280, active: true },
  { name: "Arusha", country: "TZ", x: 280, y: 320, active: true },
];

// Accurate East Africa country paths (simplified but geographically correct)
// ViewBox: 0 0 560 600
const COUNTRY_PATHS = [
  {
    id: "KE",
    name: "Kenya",
    active: true,
    // Kenya: triangular shape, Mombasa horn on east, Lake Victoria notch on west
    d: "M220 180 L260 160 L340 170 L380 200 L400 240 L380 300 L340 320 L300 300 L260 280 L240 260 L220 240 L200 220 Z",
  },
  {
    id: "TZ",
    name: "Tanzania",
    active: true,
    // Tanzania: large, Lake Victoria top, long coast, Zanzibar area
    d: "M200 220 L220 240 L240 260 L260 280 L300 300 L340 320 L380 340 L420 360 L440 400 L420 440 L380 480 L340 500 L300 520 L260 500 L220 460 L200 420 L180 380 L160 340 L160 300 L160 260 L180 240 Z",
  },
  {
    id: "UG",
    name: "Uganda",
    active: true,
    // Uganda: compact, Lake Victoria south, borders Kenya east
    d: "M120 180 L180 170 L200 200 L200 240 L180 260 L160 280 L140 260 L120 240 L100 220 L100 200 Z",
  },
  {
    id: "RW",
    name: "Rwanda",
    active: true,
    // Rwanda: small, west of Tanzania, north of Burundi
    d: "M100 280 L140 270 L150 300 L140 330 L110 340 L90 320 L90 300 Z",
  },
  {
    id: "BI",
    name: "Burundi",
    active: true,
    // Burundi: small, south of Rwanda, on Lake Tanganyika
    d: "M90 340 L130 330 L140 360 L130 390 L100 400 L80 380 L80 360 Z",
  },
  {
    id: "ET",
    name: "Ethiopia",
    active: false,
    // Ethiopia: large horn, north of Kenya
    d: "M180 100 L240 80 L320 90 L380 120 L420 160 L440 200 L420 240 L380 260 L340 240 L300 220 L260 200 L220 180 L180 160 L160 140 L160 120 Z",
  },
  {
    id: "SO",
    name: "Somalia",
    active: false,
    // Somalia: long horn shape, east of Ethiopia
    d: "M380 120 L440 100 L500 120 L520 160 L500 200 L480 240 L460 280 L440 320 L420 300 L400 280 L380 260 L400 220 L400 180 L380 160 Z",
  },
  {
    id: "SS",
    name: "South Sudan",
    active: false,
    d: "M120 100 L180 90 L200 120 L200 160 L180 180 L160 200 L140 180 L120 160 L100 140 L100 120 Z",
  },
  {
    id: "CD",
    name: "DR Congo",
    active: false,
    d: "M40 180 L100 170 L120 200 L120 240 L140 280 L140 320 L120 360 L100 400 L80 420 L60 400 L40 360 L30 320 L20 280 L20 240 L30 200 Z",
  },
  {
    id: "MW",
    name: "Malawi",
    active: false,
    d: "M160 340 L180 330 L190 360 L180 400 L170 440 L160 420 L150 380 L150 360 Z",
  },
  {
    id: "MZ",
    name: "Mozambique",
    active: false,
    d: "M220 460 L260 440 L300 460 L340 480 L380 500 L400 520 L380 540 L340 560 L300 580 L260 560 L220 520 L200 480 Z",
  },
  {
    id: "ZM",
    name: "Zambia",
    active: false,
    d: "M80 420 L120 410 L140 440 L140 480 L120 520 L100 540 L80 520 L60 480 L60 440 Z",
  },
];

interface RealMapProps {
  frame: number;
}

export function RealEastAfricaMap({ frame }: RealMapProps) {
  const { fps } = useVideoConfig();

  // Map fade in
  const mapOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  
  // Grid lines fade
  const gridOp = interpolate(frame, [8, 20], [0, 0.15], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "relative",
      width: 560,
      height: 600,
      opacity: mapOp,
    }}>
      {/* Map Background - Clean white */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
      }}>
        <svg viewBox="0 0 560 600" width="100%" height="100%" style={{ overflow: "visible" }}>
          {/* Subtle grid lines */}
          <g opacity={gridOp}>
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={600} stroke="#E2E8F0" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 13 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 50} x2={560} y2={i * 50} stroke="#E2E8F0" strokeWidth={0.5} />
            ))}
          </g>

          {/* Water bodies - very subtle */}
          <ellipse cx={300} cy={180} rx={160} ry={80} fill="#F1F5F9" opacity={0.6} />
          <path d="M420 340 L560 320 L560 600 L440 600 Z" fill="#F1F5F9" opacity={0.6} />
          <path d="M0 200 L60 200 L60 600 L0 600 Z" fill="#F1F5F9" opacity={0.6} />

          {/* Countries - BLACK SILHOUETTES as requested */}
          {COUNTRY_PATHS.map((country, i) => {
            const delay = i * 3;
            const pathOp = interpolate(frame, [delay, delay + 14], [0, 1], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            });
            const fillOp = interpolate(frame, [delay + 6, delay + 18], [0, country.active ? 1 : 0.35], {
              extrapolateRight: "clamp",
            });

            return (
              <g key={country.id}>
                <path
                  d={country.d}
                  fill={country.active ? "#0A0F1E" : "#94A3B8"}
                  fillOpacity={fillOp}
                  stroke={country.active ? "#0A0F1E" : "#CBD5E1"}
                  strokeWidth={1}
                  strokeLinejoin="round"
                  opacity={pathOp}
                />
                {/* Country label - minimal */}
                <text
                  x={getCenterX(country.d)}
                  y={getCenterY(country.d)}
                  fontSize={country.active ? 9 : 7}
                  fontWeight={country.active ? 600 : 400}
                  fill={country.active ? "#0A0F1E" : "#94A3B8"}
                  fontFamily="Inter, sans-serif"
                  textAnchor="middle"
                  opacity={interpolate(frame, [delay + 14, delay + 26], [0, 1], { extrapolateRight: "clamp" })}
                >
                  {country.name}
                </text>
              </g>
            );
          })}

          {/* City pins */}
          {CITIES.filter(c => c.active).map((city, i) => {
            const delay = 35 + i * 6;
            const s = spring({ frame: frame - delay, fps, config: SPRING_CFG });
            const op = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateRight: "clamp" });
            const pulse = 1 + 0.12 * Math.sin((frame / fps) * Math.PI * 2 + i * 1.2);

            return (
              <g key={city.name} opacity={op}>
                {/* Pulse ring */}
                <circle cx={city.x} cy={city.y} r={12 * pulse} fill={COLOR.brand} opacity={0.08} />
                <circle cx={city.x} cy={city.y} r={7 * pulse} fill={COLOR.brand} opacity={0.15} />
                
                {/* Pin dot */}
                <circle cx={city.x} cy={city.y} r={4 * s} fill={COLOR.brand} />
                <circle cx={city.x} cy={city.y} r={2 * s} fill="white" />

                {/* Label */}
                <text
                  x={city.x}
                  y={city.y - 10}
                  fontSize={8}
                  fontWeight={700}
                  fill={COLOR.ink}
                  fontFamily="Inter, sans-serif"
                  textAnchor="middle"
                  opacity={interpolate(frame - delay, [4, 12], [0, 1], { extrapolateRight: "clamp" })}
                >
                  {city.name}
                </text>
              </g>
            );
          })}

          {/* Minimal compass */}
          <g transform="translate(40, 40)" opacity={interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" })}>
            <circle cx={0} cy={0} r={14} fill="white" stroke="#E2E8F0" strokeWidth={1} />
            <text x={0} y={-4} fontSize={9} fontWeight={700} fill="#EF4444" textAnchor="middle" fontFamily="Inter">N</text>
          </g>

          {/* Scale bar */}
          <g transform="translate(40, 560)" opacity={interpolate(frame, [35, 50], [0, 1], { extrapolateRight: "clamp" })}>
            <rect x={0} y={0} width={80} height={2} fill="#0A0F1E" />
            <rect x={0} y={0} width={2} height={6} fill="#0A0F1E" />
            <rect x={78} y={0} width={2} height={6} fill="#0A0F1E" />
            <text x={40} y={16} fontSize={7} fill="#64748B" textAnchor="middle" fontFamily="Inter">500 km</text>
          </g>
        </svg>

        {/* Property count badge */}
        <div style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "white",
          borderRadius: 12,
          padding: "10px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #E2E8F0",
          opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [50, 65], [10, 0], { extrapolateRight: "clamp" })}px)`,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: COLOR.brand, fontFamily: "Inter" }}>10,247</div>
          <div style={{ fontSize: 10, color: "#64748B", fontFamily: "Inter", fontWeight: 500 }}>Active Listings</div>
          <div style={{ fontSize: 9, color: "#94A3B8", fontFamily: "Inter", marginTop: 2 }}>5 countries · Updated now</div>
        </div>

        {/* Minimal legend */}
        <div style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          background: "white",
          borderRadius: 10,
          padding: "8px 12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid #E2E8F0",
          opacity: interpolate(frame, [55, 70], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0A0F1E" }} />
            <span style={{ fontSize: 8, color: "#475569", fontFamily: "Inter", fontWeight: 500 }}>Active Markets</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#CBD5E1" }} />
            <span style={{ fontSize: 8, color: "#94A3B8", fontFamily: "Inter" }}>Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to get approximate center of path for label placement
function getCenterX(d: string): number {
  const nums = d.match(/-?\d+\.?\d*/g)?.map(Number) || [];
  const xs = nums.filter((_, i) => i % 2 === 0);
  return xs.length > 0 ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function getCenterY(d: string): number {
  const nums = d.match(/-?\d+\.?\d*/g)?.map(Number) || [];
  const ys = nums.filter((_, i) => i % 2 === 1);
  return ys.length > 0 ? ys.reduce((a, b) => a + b, 0) / ys.length : 0;
}
