import { interpolate } from "remotion";
import { COLOR, EASE, RADIUS, SHADOW } from "../../design";
import { VehicleCard } from "../VehicleCard";
import { TypingText } from "../TypingText";

interface HomeScreenProps {
  frame: number;
  showTyping?: boolean;
  hideSearchBar?: boolean;
}

const SEARCH = "Toyota Hilux";

export function HomeScreen({ frame, showTyping = false, hideSearchBar = false }: HomeScreenProps) {
  const contentOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const heroOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const heroY = interpolate(frame, [4, 22], [12, 0], { extrapolateRight: "clamp", easing: EASE });
  const chipsOp = interpolate(frame, [12, 30], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const card1Op = interpolate(frame, [22, 40], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const card1Y = interpolate(frame, [22, 40], [12, 0], { extrapolateRight: "clamp", easing: EASE });
  const card2Op = interpolate(frame, [28, 46], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const card2Y = interpolate(frame, [28, 46], [12, 0], { extrapolateRight: "clamp", easing: EASE });

  return (
    <div style={{ height: "100%", background: COLOR.surface, display: "flex", flexDirection: "column", opacity: contentOp }}>
      {/* Top bar */}
      <div style={{
        background: COLOR.bg,
        padding: "14px 14px 10px",
        borderBottom: `1px solid ${COLOR.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 17, fontWeight: 700, color: COLOR.brand,
          fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em",
        }}>
          Motokah
        </div>
        <div style={{
          width: 28, height: 28,
          background: COLOR.brandSoft,
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12,
        }}>
          🔔
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "hidden", padding: "12px 12px 0" }}>
        {/* Hero card */}
        <div style={{
          background: COLOR.brandSoft,
          borderRadius: RADIUS.lg,
          padding: "14px 16px",
          marginBottom: 10,
          opacity: heroOp,
          transform: `translateY(${heroY}px)`,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLOR.ink, fontFamily: "Inter, sans-serif", marginBottom: 2 }}>
            Find your next car.
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: COLOR.inkSoft, fontFamily: "Inter, sans-serif" }}>
            Across East Africa.
          </div>
        </div>

        {/* Search bar */}
        {!hideSearchBar && (
          <div style={{
            background: COLOR.bg,
            borderRadius: RADIUS.md,
            border: `1px solid ${COLOR.border}`,
            boxShadow: SHADOW.card,
            padding: "9px 12px",
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 10,
            opacity: heroOp,
          }}>
            <span style={{ fontSize: 12, opacity: 0.5 }}>🔍</span>
            <div style={{ fontSize: 11, color: COLOR.inkMute, fontFamily: "Inter, sans-serif", flex: 1 }}>
              {showTyping ? (
                <TypingText text={SEARCH} startFrame={0} charsPerFrame={0.5} />
              ) : (
                <span>Toyota Hilux, Land Cruiser, Vitz…</span>
              )}
            </div>
          </div>
        )}

        {/* Category chips */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 12, flexWrap: "nowrap",
          opacity: chipsOp,
        }}>
          {["Cars", "SUVs", "Pickups", "Bikes"].map((cat, i) => (
            <div key={cat} style={{
              padding: "5px 10px",
              borderRadius: 99,
              background: i === 0 ? COLOR.brand : COLOR.bg,
              color: i === 0 ? "#fff" : COLOR.inkSoft,
              fontSize: 9,
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              border: `1px solid ${i === 0 ? COLOR.brand : COLOR.border}`,
              whiteSpace: "nowrap",
            }}>
              {cat}
            </div>
          ))}
        </div>

        {/* Cards */}
        <div style={{ opacity: card1Op, transform: `translateY(${card1Y}px)`, marginBottom: 8 }}>
          <VehicleCard
            title="Toyota Hilux 2021"
            price="TSh 78.5M"
            location="Dar es Salaam"
            km="45,000 km"
            year="2021"
          />
        </div>
        <div style={{ opacity: card2Op, transform: `translateY(${card2Y}px)` }}>
          <VehicleCard
            title="Land Cruiser 200"
            price="TSh 145M"
            location="Nairobi, Kenya"
            km="62,000 km"
            year="2019"
            verified={true}
          />
        </div>
      </div>
    </div>
  );
}
