import { interpolate } from "remotion";
import { COLOR, EASE, RADIUS, SHADOW } from "../../design";
import { CarPhoto } from "../CarPhoto";

interface DetailScreenProps {
  frame: number;
}

export function DetailScreen({ frame }: DetailScreenProps) {
  const imageOp   = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp", easing: EASE.outExpo});
  const titleOp   = interpolate(frame, [8, 26], [0, 1],  { extrapolateRight: "clamp", easing: EASE.outExpo});
  const priceOp   = interpolate(frame, [14, 30], [0, 1], { extrapolateRight: "clamp", easing: EASE.outExpo});
  const priceScale = interpolate(frame, [14, 30], [0.96, 1], { extrapolateRight: "clamp", easing: EASE.outExpo});
  const specsOp   = interpolate(frame, [22, 38], [0, 1], { extrapolateRight: "clamp", easing: EASE.outExpo});
  const locOp     = interpolate(frame, [28, 44], [0, 1], { extrapolateRight: "clamp", easing: EASE.outExpo});
  const btnOp     = interpolate(frame, [36, 52], [0, 1], { extrapolateRight: "clamp", easing: EASE.outExpo});
  const btnY      = interpolate(frame, [36, 52], [8, 0],  { extrapolateRight: "clamp", easing: EASE.outExpo});

  // WhatsApp subtle pulse
  const wpPulse = 1 + 0.015 * Math.sin((frame / 18) * Math.PI * 2);

  const SPECS = [
    { label: "Year", value: "2021" },
    { label: "Gearbox", value: "Manual" },
    { label: "Mileage", value: "45,000 km" },
    { label: "Fuel", value: "Diesel" },
  ];

  return (
    <div style={{ height: "100%", background: COLOR.bg, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{
        background: COLOR.brand,
        padding: "14px 14px 10px",
        display: "flex", alignItems: "center", gap: 10,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, color: "#fff" }}>←</span>
        <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "Inter, sans-serif" }}>
          Toyota Hilux 2021
        </div>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>⋮</span>
      </div>

      {/* Car image */}
      <div style={{ opacity: imageOp, flexShrink: 0 }}>
        <CarPhoto width="100%" height={140} style={{ borderRadius: 0 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, overflowY: "hidden" }}>
        {/* Title */}
        <div style={{ opacity: titleOp }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLOR.ink, fontFamily: "Inter, sans-serif" }}>
            Toyota Hilux 2021 · Double Cab
          </div>
        </div>

        {/* Price */}
        <div style={{ opacity: priceOp, transform: `scale(${priceScale})`, transformOrigin: "left center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: COLOR.brandInk, fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}>
            TSh 78,500,000
          </div>
        </div>

        {/* Specs grid */}
        <div style={{ opacity: specsOp, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {SPECS.map((s) => (
            <div key={s.label} style={{
              background: COLOR.surface,
              borderRadius: RADIUS.sm,
              border: `1px solid ${COLOR.border}`,
              padding: "8px 10px",
            }}>
              <div style={{ fontSize: 8, color: COLOR.inkMute, fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: COLOR.ink, fontFamily: "Inter, sans-serif" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Location */}
        <div style={{ opacity: locOp, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 12 }}>📍</span>
          <span style={{ fontSize: 10, color: COLOR.inkSoft, fontFamily: "Inter, sans-serif" }}>
            Dar es Salaam, Kinondoni
          </span>
        </div>

        {/* Buttons */}
        <div style={{ opacity: btnOp, transform: `translateY(${btnY}px)`, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{
            background: "#25D366",
            borderRadius: RADIUS.lg,
            padding: "13px",
            textAlign: "center",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 4px 16px rgba(37,211,102,0.3)",
            transform: `scale(${wpPulse})`,
          }}>
            💬 WhatsApp Seller
          </div>
          <div style={{
            background: COLOR.bg,
            border: `1.5px solid ${COLOR.brand}`,
            borderRadius: RADIUS.lg,
            padding: "12px",
            textAlign: "center",
            color: COLOR.brandInk,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
          }}>
            📞 Call Seller
          </div>
        </div>
      </div>
    </div>
  );
}
