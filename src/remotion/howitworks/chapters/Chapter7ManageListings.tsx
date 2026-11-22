import { useCurrentFrame } from "remotion";
import { IconUser, IconLayoutDashboard, IconCar, IconHeart, IconEye, IconMapPin, IconExternalLink, IconEdit, IconCheck, IconTrash } from "@/components/icons";
import { Scene, Push, AppHeader, BottomNav, Photo, Screen, Toast, C, fade, rise } from "../kit";
import { HomeScreen, NAV_MYADS } from "../screens";

const F = { myAdsTap: 18, push: 24, tabTap: 54, list: 60, soldTap: 112, toast: 116 };
const SOLD_BTN = { x: 222, y: 480 };

// Profile.tsx: user card, Dashboard / My Listings / Saved tabs, listing card with actions.
function ProfileScreen({ frame }: { frame: number }) {
  const listing = frame >= F.list;
  const sold = frame >= F.soldTap + 2;
  const o = fade(frame, F.list, 12);
  const y = rise(frame, F.list, 18, 14);
  const tabs = [
    { I: IconLayoutDashboard, t: "Dashboard", on: !listing },
    { I: IconCar, t: "My Listings (1)", on: listing },
    { I: IconHeart, t: "Saved (0)", on: false },
  ];
  return (
    <Screen>
      <AppHeader />
      <div style={{ padding: "12px 12px 0" }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 12, display: "flex", alignItems: "center", gap: 12, height: 72, boxSizing: "border-box" }}>
          <span style={{ width: 48, height: 48, borderRadius: 24, background: C.brandSoft, color: C.brand, display: "flex", alignItems: "center", justifyContent: "center" }}><IconUser size={24} /></span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.inkStrong }}>Neema Mushi</div>
            <div style={{ fontSize: 12.5, color: C.inkSoft }}>Private Seller</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, margin: "12px 0" }}>
          {tabs.map(({ I, t, on }) => (
            <span key={t} style={{ height: 36, padding: "0 10px", borderRadius: 9, border: `1px solid ${on ? C.brand : C.border}`, background: on ? C.brand : C.card, color: on ? "#fff" : C.ink, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><I size={15} />{t}</span>
          ))}
        </div>
        {!listing ? (
          <div style={{ background: "linear-gradient(135deg, #EEF3F9, #F9FAFB)", border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.inkStrong }}>Welcome back, Neema</div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>Here's a summary of your Motokah activity</div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {[["1", "My Listings"], ["0", "Saved Cars"], ["2", "Messages"]].map(([n, l]) => (
                <div key={l} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.inkStrong }}>{n}</div>
                  <div style={{ fontSize: 11.5, color: C.inkSoft }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ opacity: o, transform: `translateY(${y}px)`, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 12 }}>
            <div style={{ position: "relative", height: 120, borderRadius: 11, overflow: "hidden", background: C.muted }}>
              <Photo src="cars/hilux-white-2019-1.jpg" h={120} style={{ filter: sold ? "grayscale(0.6)" : "none" }} />
              <span style={{ position: "absolute", top: 8, left: 8, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: sold ? "rgba(63,63,70,0.92)" : "rgba(16,185,129,0.92)" }}>{sold ? "sold" : "approved"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.inkStrong, whiteSpace: "nowrap" }}>2019 Toyota Hilux</div>
              <span style={{ fontSize: 11.5, color: C.inkSoft, background: C.muted, borderRadius: 999, padding: "2px 8px", display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}><IconEye size={13} />214 views</span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: C.brand, marginTop: 3 }}>TZS 78,500,000</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, fontSize: 12, color: C.inkSoft }}>
              <span style={{ background: C.muted, padding: "2px 7px", borderRadius: 6, fontWeight: 600 }}>2019</span>
              <span style={{ background: C.muted, padding: "2px 7px", borderRadius: 6, fontWeight: 600 }}>45,000 km</span>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}><IconMapPin size={13} />Arusha</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", borderTop: `1px solid ${C.border}`, marginTop: 10, paddingTop: 10 }}>
              <span style={{ height: 32, padding: "0 8px", whiteSpace: "nowrap", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, fontWeight: 700, color: C.ink, display: "flex", alignItems: "center", gap: 5 }}><IconExternalLink size={14} />View Ad</span>
              {!sold && <span style={{ height: 32, padding: "0 8px", whiteSpace: "nowrap", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, fontWeight: 700, color: C.ink, display: "flex", alignItems: "center", gap: 5 }}><IconEdit size={14} />Edit</span>}
              {!sold && <span style={{ height: 32, padding: "0 8px", whiteSpace: "nowrap", borderRadius: 8, border: "1px solid rgba(16,185,129,0.35)", background: frame >= F.soldTap ? "rgba(16,185,129,0.12)" : C.card, fontSize: 12.5, fontWeight: 700, color: C.okInk, display: "flex", alignItems: "center", gap: 5 }}><IconCheck size={14} />Mark as Sold</span>}
              <span style={{ marginLeft: "auto", color: C.danger, display: "flex" }}><IconTrash size={17} /></span>
            </div>
          </div>
        )}
      </div>
      <BottomNav active="My Ads" />
    </Screen>
  );
}

export function Chapter7ManageListings() {
  const frame = useCurrentFrame();
  return (
    <Scene
      step={7}
      title="Manage your ads"
      line="See views, edit details, or mark your car as sold from My Ads."
      shots={[
        { f: 0, x: 180, y: 470, z: 1.18 },
        { f: F.myAdsTap + 6, x: 180, y: 470, z: 1.18 },
        { f: F.push + 14, x: 180, y: 300, z: 1 },
        { f: F.tabTap - 10, x: 180, y: 200, z: 1.18 },
        { f: F.tabTap + 4, x: 180, y: 200, z: 1.18 },
        { f: F.list + 18, x: 180, y: 320, z: 1 },
        { f: 92, x: 180, y: 360, z: 1.15 },
        { f: F.soldTap - 4, x: 180, y: SOLD_BTN.y - 60, z: 1.18 },
        { f: F.toast + 10, x: 180, y: SOLD_BTN.y - 60, z: 1.18 },
        { f: F.toast + 30, x: 180, y: 300, z: 1 },
      ]}
      taps={[{ frame: F.myAdsTap, x: NAV_MYADS.x, y: NAV_MYADS.y }, { frame: F.tabTap, x: 160, y: 200 }, { frame: F.soldTap, x: SOLD_BTN.x, y: SOLD_BTN.y }]}
    >
      <Push frame={frame} a={F.push} b={F.push + 14} from={<HomeScreen section="deals" />} to={<ProfileScreen frame={frame} />} />
      <Toast frame={frame} at={F.toast} title="Marked as sold" body="" />
    </Scene>
  );
}

export const CHAPTER7_DURATION = 175;
