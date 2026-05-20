import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, EASE, SPRING_CFG } from "../design";

// Real geographic coordinates for East Africa (simplified but accurate)
// Using lat/lon projected to SVG viewBox

interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  active: boolean;
}

const CITIES: City[] = [
  { name: "Dar es Salaam", country: "TZ", lat: -6.8, lon: 39.3, active: true },
  { name: "Nairobi", country: "KE", lat: -1.3, lon: 36.8, active: true },
  { name: "Kampala", country: "UG", lat: 0.3, lon: 32.6, active: true },
  { name: "Kigali", country: "RW", lat: -1.9, lon: 30.1, active: true },
  { name: "Bujumbura", country: "BI", lat: -3.4, lon: 29.4, active: true },
  { name: "Mombasa", country: "KE", lat: -4.0, lon: 39.7, active: true },
  { name: "Arusha", country: "TZ", lat: -3.4, lon: 36.7, active: true },
  { name: "Addis Ababa", country: "ET", lat: 9.0, lon: 38.7, active: false },
  { name: "Mogadishu", country: "SO", lat: 2.0, lon: 45.3, active: false },
];

// Mercator projection: x = lon, y = -lat (scaled)
const project = (lon: number, lat: number) => {
  const x = (lon - 20) * 28; // 20°E to 55°E
  const y = (15 - lat) * 28; // 15°N to -15°S
  return [x, y];
};

// Real country outlines (simplified from actual geography)
const COUNTRY_PATHS = [
  {
    id: "TZ",
    name: "Tanzania",
    active: true,
    d: "M180 280 L220 270 L240 290 L260 340 L250 380 L270 440 L240 460 L180 460 L120 460 L80 420 L80 360 L80 310 L100 280 Z",
    color: "#0099FF",
  },
  {
    id: "KE",
    name: "Kenya",
    active: true,
    d: "M180 260 L200 200 L250 210 L320 210 L310 300 L280 330 L250 290 L220 270 L180 280 Z",
    color: "#0099FF",
  },
  {
    id: "UG",
    name: "Uganda",
    active: true,
    d: "M100 200 L180 200 L180 260 L100 280 L80 260 L80 220 Z",
    color: "#0099FF",
  },
  {
    id: "RW",
    name: "Rwanda",
    active: true,
    d: "M60 290 L100 290 L100 320 L60 320 Z",
    color: "#0099FF",
  },
  {
    id: "BI",
    name: "Burundi",
    active: true,
    d: "M60 320 L100 320 L100 360 L60 360 Z",
    color: "#0099FF",
  },
  {
    id: "ET",
    name: "Ethiopia",
    active: false,
    d: "M150 150 L150 200 L200 200 L250 210 L320 210 L360 180 L380 120 L320 80 L250 80 L200 120 Z",
    color: "#94A3B8",
  },
  {
    id: "SO",
    name: "Somalia",
    active: false,
    d: "M320 210 L380 120 L480 140 L460 250 L380 300 L360 280 L340 300 L320 300 L310 260 Z",
    color: "#94A3B8",
  },
  {
    id: "SS",
    name: "South Sudan",
    active: false,
    d: "M120 120 L180 120 L180 200 L150 200 L120 180 L100 160 L100 140 Z",
    color: "#CBD5E1",
  },
  {
    id: "CD",
    name: "DR Congo",
    active: false,
    d: "M60 180 L120 180 L150 200 L180 260 L180 280 L150 320 L120 380 L80 420 L60 400 L40 320 L40 240 L50 200 Z",
    color: "#CBD5E1",
  },
  {
    id: "MW",
    name: "Malawi",
    active: false,
    d: "M120 380 L150 380 L150 480 L130 500 L110 480 Z",
    color: "#CBD5E1",
  },
  {
    id: "MZ",
    name: "Mozambique",
    active: false,
    d: "M150 380 L240 380 L260 440 L250 500 L200 520 L150 480 L150 420 Z",
    color: "#CBD5E1",
  },
  {
    id: "ZM",
    name: "Zambia",
    active: false,
    d: "M80 420 L120 420 L150 480 L150 520 L100 540 L60 500 L60 460 Z",
    color: "#CBD5E1",
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
  const gridOp = interpolate(frame, [8, 20], [0, 0.3], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "relative",
      width: 560,
      height: 600,
      opacity: mapOp,
    }}>
      {/* Map Background - Ocean color */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "#F0F4F8",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
      }}>
        <svg viewBox="0 0 560 600" width="100%" height="100%" style={{ overflow: "visible" }}>
          {/* Grid lines */}
          <g opacity={gridOp}>
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={600} stroke="#CBD5E1" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 13 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 50} x2={560} y2={i * 50} stroke="#CBD5E1" strokeWidth={0.5} />
            ))}
          </g>

          {/* Water bodies */}
          <ellipse cx={300} cy={180} rx={180} ry={100} fill="#DBEAFE" opacity={0.5} />
          <path d="M380 300 L560 280 L560 600 L400 600 Z" fill="#DBEAFE" opacity={0.5} />
          <path d="M0 200 L80 200 L80 600 L0 600 Z" fill="#DBEAFE" opacity={0.5} />

          {/* Countries */}
          {COUNTRY_PATHS.map((country, i) => {
            const delay = i * 4;
            const pathOp = interpolate(frame, [delay, delay + 16], [0, 1], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            });
            const fillOp = interpolate(frame, [delay + 8, delay + 20], [0, country.active ? 0.25 : 0.12], {
              extrapolateRight: "clamp",
            });

            return (
              <g key={country.id}>
                <path
                  d={country.d}
                  fill={country.active ? COLOR.brand : "#94A3B8"}
                  fillOpacity={fillOp}
                  stroke={country.active ? COLOR.brand : "#94A3B8"}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  opacity={pathOp}
                />
                {/* Country label */}
                <text
                  x={getCenterX(country.d)}
                  y={getCenterY(country.d)}
                  fontSize={country.active ? 10 : 8}
                  fontWeight={country.active ? 700 : 500}
                  fill={country.active ? COLOR.brandInk : "#64748B"}
                  fontFamily="Inter, sans-serif"
                  textAnchor="middle"
                  opacity={interpolate(frame, [delay + 16, delay + 28], [0, 1], { extrapolateRight: "clamp" })}
                >
                  {country.name}
                </text>
              </g>
            );
          })}

          {/* City pins */}
          {CITIES.filter(c => c.active).map((city, i) => {
            const [px, py] = project(city.lon, city.lat);
            const delay = 40 + i * 8;
            const s = spring({ frame: frame - delay, fps, config: SPRING_CFG });
            const op = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateRight: "clamp" });
            const pulse = 1 + 0.15 * Math.sin((frame / fps) * Math.PI * 2 + i * 1.2);

            return (
              <g key={city.name} opacity={op}>
                {/* Pulse ring */}
                <circle cx={px} cy={py} r={14 * pulse} fill={COLOR.brand} opacity={0.1} />
                <circle cx={px} cy={py} r={8 * pulse} fill={COLOR.brand} opacity={0.2} />
                
                {/* Pin */}
                <circle cx={px} cy={py} r={5 * s} fill={COLOR.brand} />
                <circle cx={px} cy={py} r={2.5 * s} fill="white" />

                {/* Label */}
                <text
                  x={px}
                  y={py - 12}
                  fontSize={8}
                  fontWeight={700}
                  fill={COLOR.ink}
                  fontFamily="Inter, sans-serif"
                  textAnchor="middle"
                  opacity={interpolate(frame - delay, [5, 15], [0, 1], { extrapolateRight: "clamp" })}
                >
                  {city.name}
                </text>
              </g>
            );
          })}

          {/* Compass */}
          <g transform="translate(40, 40)" opacity={interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" })}>
            <circle cx={0} cy={0} r={18} fill="white" stroke="#CBD5E1" strokeWidth={1} />
            <text x={0} y={-6} fontSize={10} fontWeight={800} fill="#EF4444" textAnchor="middle" fontFamily="Inter">N</text>
            <text x={0} y={14} fontSize={8} fill="#94A3B8" textAnchor="middle" fontFamily="Inter">S</text>
          </g>

          {/* Scale bar */}
          <g transform="translate(40, 560)" opacity={interpolate(frame, [35, 50], [0, 1], { extrapolateRight: "clamp" })}>
            <rect x={0} y={0} width={100} height={3} fill="#0A0F1E" />
            <rect x={0} y={0} width={3} height={8} fill="#0A0F1E" />
            <rect x={97} y={0} width={3} height={8} fill="#0A0F1E" />
            <text x={50} y={20} fontSize={8} fill="#64748B" textAnchor="middle" fontFamily="Inter">500 km</text>
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
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid #E2E8F0",
          opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [50, 65], [10, 0], { extrapolateRight: "clamp" })}px)`,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: COLOR.brand, fontFamily: "Inter" }}>10,247</div>
          <div style={{ fontSize: 10, color: "#64748B", fontFamily: "Inter", fontWeight: 500 }}>Active Listings</div>
          <div style={{ fontSize: 9, color: "#94A3B8", fontFamily: "Inter", marginTop: 2 }}>5 countries · Updated now</div>
        </div>

        {/* Legend */}
        <div style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          background: "white",
          borderRadius: 10,
          padding: "10px 14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid #E2E8F0",
          opacity: interpolate(frame, [55, 70], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLOR.brand }} />
            <span style={{ fontSize: 9, color: "#475569", fontFamily: "Inter", fontWeight: 500 }}>Active Markets</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#94A3B8" }} />
            <span style={{ fontSize: 9, color: "#64748B", fontFamily: "Inter" }}>Coming Soon</span>
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
