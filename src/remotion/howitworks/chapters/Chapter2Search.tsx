import { useCurrentFrame } from "remotion";
import { IconX } from "@/components/icons";
import { Scene, ListingCard, Typed, Button, C, prog, fade, rise, APP_H } from "../kit";
import { SearchScreen } from "../screens";

const F = { type: 12, searchTap: 50, results: 58, filtersTap: 84, sheet: 90, cityTap: 112, priceTap: 128, showTap: 146, done: 154 };

const CITIES = ["Dar es Salaam", "Arusha", "Mwanza", "Dodoma"];
const PRICES = ["Under 50M", "Under 100M", "Under 150M"];

export function Chapter2Search() {
  const frame = useCurrentFrame();
  const searched = frame >= F.results;
  const filtered = frame >= F.done;
  const sheetT = prog(frame, F.sheet, F.sheet + 14) - prog(frame, F.showTap + 2, F.showTap + 14);
  const cardO = fade(frame, filtered ? F.done : F.results, 12);
  const cardY = rise(frame, filtered ? F.done : F.results, 20, 16);

  return (
    <Scene
      step={2}
      title="Search and filter"
      line="Type what you want, then narrow it down by city and price."
      shots={[
        { f: 0, x: 180, y: 140, z: 1.18 },
        { f: F.searchTap + 4, x: 180, y: 140, z: 1.18 },
        { f: F.results + 14, x: 180, y: 300, z: 1 },
        { f: F.sheet + 10, x: 180, y: 300, z: 1 },
        { f: F.sheet + 22, x: 180, y: 420, z: 1.1 },
        { f: F.showTap + 4, x: 180, y: 420, z: 1.1 },
        { f: F.done + 14, x: 180, y: 300, z: 1 },
      ]}
      taps={[
        { frame: F.searchTap, x: 325, y: 121 },
        { frame: F.filtersTap, x: 50, y: 216 },
        { frame: F.cityTap, x: 178, y: 335 },
        { frame: F.priceTap, x: 163, y: 451 },
        { frame: F.showTap, x: 180, y: 515 },
      ]}
    >
      <SearchScreen
        title={searched ? "Toyota Hilux for Sale" : "Vehicles for Sale in East Africa"}
        count={filtered ? "18 vehicles found" : searched ? "64 vehicles found" : "2,140 vehicles found"}
        chips={filtered ? ["Toyota Hilux", "Arusha", "Under 100M"] : searched ? ["Toyota Hilux"] : []}
        queryActive={frame >= F.type && frame < F.searchTap}
        query={frame >= F.type ? <Typed text="Toyota Hilux" start={F.type} cps={0.42} caret={frame < F.searchTap} /> : undefined}
      >
        {searched && (
          <div style={{ opacity: cardO, transform: `translateY(${cardY}px)` }}>
            {filtered ? (
              <ListingCard title="2019 Toyota Hilux Double Cab" price="TZS 78,500,000" city="Arusha" km="45,000 km" year="2019" body="Pickup" photo="cars/hilux-white-2019-1.jpg" views={93} />
            ) : (
              <ListingCard title="2019 Toyota Hilux Double Cab" price="TZS 92,000,000" city="Dar es Salaam" km="71,000 km" year="2019" body="Pickup" photo="cars/hilux-gray-2019-1.jpg" views={120} />
            )}
          </div>
        )}
      </SearchScreen>

      {sheetT > 0 && (
        <>
          <div style={{ position: "absolute", inset: 0, background: `rgba(15,25,35,${0.45 * sheetT})`, zIndex: 8 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, height: APP_H - 230, background: C.card, borderTopLeftRadius: 22, borderTopRightRadius: 22, zIndex: 9, transform: `translateY(${(1 - sheetT) * 100}%)`, padding: "10px 16px 0", boxSizing: "border-box", boxShadow: "0 -10px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ width: 40, height: 5, borderRadius: 3, background: C.border, margin: "0 auto 12px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: C.inkStrong }}>Filters</div>
              <IconX size={20} style={{ color: C.inkSoft }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft, marginBottom: 8 }}>City</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {CITIES.map((c) => {
                const on = c === "Arusha" && frame >= F.cityTap + 2;
                return <span key={c} style={{ padding: "7px 10px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: `1px solid ${on ? C.brand : C.border}`, background: on ? C.brand : C.card, color: on ? "#fff" : C.ink }}>{c}</span>;
              })}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft, marginBottom: 8 }}>Price (TZS)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {PRICES.map((p) => {
                const on = p === "Under 100M" && frame >= F.priceTap + 2;
                return <span key={p} style={{ padding: "7px 10px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: `1px solid ${on ? C.brand : C.border}`, background: on ? C.brand : C.card, color: on ? "#fff" : C.ink }}>{p}</span>;
              })}
            </div>
            <Button pressed={frame >= F.showTap && frame < F.showTap + 6}>Show 18 results</Button>
          </div>
        </>
      )}
    </Scene>
  );
}

export const CHAPTER2_DURATION = 185;
