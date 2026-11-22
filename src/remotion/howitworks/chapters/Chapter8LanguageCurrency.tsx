import { useCurrentFrame } from "remotion";
import { IconMapPin, IconCheck, IconChevronDown, IconMoon, IconHelpCircle } from "@/components/icons";
import { Scene, Flag, C, prog, fade, APP_H } from "../kit";
import { HomeScreen, HOME_MENU } from "../screens";

const F = { menuTap: 22, open: 28, swTap: 62, currTap: 92, list: 96, kesTap: 118, closeTap: 140, close: 144 };
const LANGS = [
  { code: "GB" as const, name: "English" },
  { code: "TZ" as const, name: "Kiswahili" },
  { code: "FR" as const, name: "Français" },
  { code: "SA" as const, name: "العربية" },
];
const CURRENCIES = ["Auto", "TZS", "KES", "UGX", "RWF", "BIF", "ETB", "NGN", "USD"];
const SW = { x: 281, y: 332 };
const SELECT = { x: 288, y: 433 };
const KES = { x: 285, y: 537 };
const SHEET_X = 70;

// Header.tsx mobile menu sheet: links, LanguageSwitcher (mobile grid), CurrencySwitcher.
export function Chapter8LanguageCurrency() {
  const frame = useCurrentFrame();
  const swahili = frame >= F.swTap + 2;
  const kes = frame >= F.kesTap + 2;
  const sheetT = prog(frame, F.open, F.open + 14) - prog(frame, F.close, F.close + 14);
  const listO = frame >= F.list && frame < F.kesTap + 6 ? fade(frame, F.list, 6) : 0;

  return (
    <Scene
      step={8}
      title="Language and currency"
      line="Switch to Kiswahili and show prices in your own currency."
      shots={[
        { f: 0, x: 180, y: 300, z: 1 },
        { f: F.menuTap - 10, x: 260, y: 80, z: 1.6 },
        { f: F.menuTap + 4, x: 260, y: 80, z: 1.6 },
        { f: F.open + 16, x: 215, y: 340, z: 1.22 },
        { f: F.swTap + 6, x: 215, y: 360, z: 1.22 },
        { f: F.currTap - 4, x: 215, y: 440, z: 1.22 },
        { f: F.kesTap + 6, x: 215, y: 440, z: 1.22 },
        { f: F.close + 4, x: 180, y: 300, z: 1 },
        { f: F.close + 26, x: 180, y: 300, z: 1 },
        { f: F.close + 44, x: 180, y: 300, z: 1.1 },
      ]}
      taps={[
        { frame: F.menuTap, x: HOME_MENU.x, y: HOME_MENU.y },
        { frame: F.swTap, x: SW.x, y: SW.y },
        { frame: F.currTap, x: SELECT.x, y: SELECT.y },
        { frame: F.kesTap, x: KES.x, y: KES.y },
        { frame: F.closeTap, x: 35, y: 300 },
      ]}
    >
      <HomeScreen section="deals" lang={swahili ? "sw" : "en"} price={kes ? "KES 7,194,231" : "TZS 145,000,000"} />

      {sheetT > 0 && (
        <>
          <div style={{ position: "absolute", inset: 0, background: `rgba(15,25,35,${0.5 * sheetT})`, zIndex: 8 }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: SHEET_X, right: 0, height: APP_H, background: "#F4F6F8", zIndex: 9, transform: `translateX(${(1 - sheetT) * 100}%)`, boxShadow: "-12px 0 30px rgba(0,0,0,0.18)", padding: "34px 16px 0", boxSizing: "border-box" }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: C.brand, marginBottom: 12 }}>Motokah</div>
            {[swahili ? "Magari ya Kutumika" : "Used Cars", swahili ? "Magari Mapya" : "New Cars", swahili ? "Biashara" : "Commercial", swahili ? "Pikipiki" : "Bikes"].map((l) => (
              <div key={l} style={{ height: 40, display: "flex", alignItems: "center", fontSize: 14.5, color: C.ink }}>{l}</div>
            ))}
            <div style={{ height: 40, display: "flex", alignItems: "center", gap: 7, fontSize: 14.5, color: C.ink }}><IconMapPin size={17} />Change Location (Tanzania)</div>
            <div style={{ height: 1, background: C.border, margin: "8px 0 12px" }} />
            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.inkSoft, letterSpacing: "0.04em", marginBottom: 8 }}>LANGUAGE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {LANGS.map((l, i) => {
                const on = swahili ? i === 1 : i === 0;
                return (
                  <span key={l.code} style={{ height: 40, borderRadius: 9, border: `1px solid ${on ? C.brand : C.border}`, background: on ? C.brandSoft : C.card, color: on ? C.brand : C.ink, fontSize: 13.5, fontWeight: on ? 700 : 500, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", boxSizing: "border-box" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Flag code={l.code} w={19} />{l.name}</span>
                    {on && <IconCheck size={15} />}
                  </span>
                );
              })}
            </div>
            <div style={{ height: 42, display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, fontSize: 14.5 }}>
              <span style={{ color: C.inkSoft }}>Currency</span>
              <span style={{ width: 112, height: 40, borderRadius: 8, border: `${frame >= F.currTap && frame < F.kesTap + 4 ? 2 : 1}px solid ${frame >= F.currTap && frame < F.kesTap + 4 ? C.brand : C.border}`, background: C.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", boxSizing: "border-box", fontSize: 13.5, fontWeight: 700, color: C.inkStrong }}>
                {kes ? "KES" : "Auto"}<IconChevronDown size={14} />
              </span>
            </div>
            {listO > 0 && (
              <div style={{ position: "absolute", left: 160, width: 112, top: 462, background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: "0 14px 34px rgba(0,0,0,0.2)", opacity: listO, overflow: "hidden" }}>
                {CURRENCIES.slice(0, 5).map((c) => {
                  const on = c === "KES" && frame >= F.kesTap;
                  return <div key={c} style={{ height: 30, display: "flex", alignItems: "center", padding: "0 10px", fontSize: 13.5, fontWeight: 600, background: on ? C.brand : "transparent", color: on ? "#fff" : C.ink }}>{c}</div>;
                })}
              </div>
            )}
            <div style={{ height: 1, background: C.border, margin: "12px 0 6px" }} />
            <div style={{ height: 40, display: "flex", alignItems: "center", gap: 7, fontSize: 14.5, color: C.ink }}><IconMoon size={17} />{swahili ? "Giza" : "Dark Mode"}</div>
            <div style={{ height: 40, display: "flex", alignItems: "center", gap: 7, fontSize: 14.5, color: C.ink }}><IconHelpCircle size={17} />How It Works</div>
          </div>
        </>
      )}
    </Scene>
  );
}

export const CHAPTER8_DURATION = 210;
