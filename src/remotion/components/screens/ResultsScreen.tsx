import { interpolate } from "remotion";
import { COLOR, EASE, RADIUS } from "../../design";
import { VehicleCard } from "../VehicleCard";

interface ResultsScreenProps {
  frame: number;
}

const CARS = [
  { title: "Toyota Hilux 2021", price: "TSh 78.5M", location: "Dar es Salaam", km: "45,000 km", year: "2021" },
  { title: "Toyota Hilux 2019", price: "TSh 62M",   location: "Arusha, TZ",    km: "68,000 km", year: "2019" },
  { title: "Toyota Hilux 2022", price: "TSh 95M",   location: "Nairobi, KE",   km: "28,000 km", year: "2022" },
];

export function ResultsScreen({ frame }: ResultsScreenProps) {
  const headerOp = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp", easing: EASE.outExpo});
  const chipsOp  = interpolate(frame, [8, 24], [0, 1], { extrapolateRight: "clamp", easing: EASE.outExpo});

  return (
    <div style={{ height: "100%", background: COLOR.surface, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{
        background: COLOR.bg,
        padding: "14px 14px 10px",
        borderBottom: `1px solid ${COLOR.border}`,
        display: "flex", alignItems: "center", gap: 10,
        opacity: headerOp, flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, color: COLOR.brand }}>←</span>
        <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 700, color: COLOR.ink, fontFamily: "Inter, sans-serif" }}>
          Toyota Hilux
        </div>
        <span style={{ fontSize: 14 }}>⚙</span>
      </div>

      {/* Filter chips */}
      <div style={{
        padding: "8px 12px",
        display: "flex", gap: 6, flexWrap: "nowrap",
        background: COLOR.bg,
        borderBottom: `1px solid ${COLOR.border}`,
        opacity: chipsOp, flexShrink: 0,
      }}>
        {["Dar es Salaam ×", "2018–2024 ×", "Diesel ×"].map((chip) => (
          <div key={chip} style={{
            padding: "4px 9px",
            borderRadius: 99,
            background: COLOR.brandSoft,
            color: COLOR.brandInk,
            fontSize: 8,
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
            border: `1px solid ${COLOR.brand}44`,
            whiteSpace: "nowrap",
          }}>
            {chip}
          </div>
        ))}
      </div>

      {/* Count */}
      <div style={{
        padding: "6px 14px",
        fontSize: 9, color: COLOR.inkMute,
        fontFamily: "Inter, sans-serif",
        opacity: chipsOp, flexShrink: 0,
      }}>
        247 results
      </div>

      {/* Cards — ALREADY VISIBLE, no fade-in */}
      <div style={{ flex: 1, overflowY: "hidden", padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {CARS.map((car, i) => (
          <div key={i}>
            <VehicleCard {...car} />
          </div>
        ))}
      </div>
    </div>
  );
}
