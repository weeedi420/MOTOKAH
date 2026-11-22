import { interpolate, useCurrentFrame, Easing } from "remotion";
import { IconArrowLeft, IconChevronLeft, IconChevronRight, IconZoomIn, IconCalendar, IconGauge, IconManualGearbox, IconMapPin, IconMessage, IconPhone, IconShieldCheck, IconHeart, IconShare, IconFlag } from "@/components/icons";
import { Scene, Push, Typed, AppHeader, BottomNav, Photo, Screen, C, HEADER_H } from "../kit";
import { ChatScreen, CHAT_SEND } from "../screens";

const F = { scrollA: 30, scrollB: 52, msgTap: 64, push: 70, type: 92, send: 128, dots: 138, reply: 160 };
const SCROLL = 300;
const MSG_Y = HEADER_H + 626 - SCROLL;

// ListingDetail.tsx + SellerCard.tsx, recreated.
function DetailScreen({ scroll, pressed }: { scroll: number; pressed: boolean }) {
  const spec = [
    { I: IconCalendar, k: "Year", v: "2019" },
    { I: IconGauge, k: "Mileage", v: "62,000 km" },
    { I: IconManualGearbox, k: "Gearbox", v: "Automatic" },
    { I: IconMapPin, k: "Location", v: "Dar es Salaam" },
  ];
  return (
    <Screen>
      <div style={{ position: "absolute", left: 0, right: 0, top: HEADER_H, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 12, right: 12, top: 10 - scroll }}>
          <span style={{ height: 32, padding: "0 10px", border: `1px solid ${C.border}`, borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: C.ink, background: C.card }}><IconArrowLeft size={14} />Back</span>
          <div style={{ fontSize: 12.5, color: C.inkSoft, margin: "10px 0 8px" }}>Home <span style={{ margin: "0 4px" }}>&gt;</span> SUV <span style={{ margin: "0 4px" }}>&gt;</span> <span style={{ color: C.inkStrong, fontWeight: 600 }}>2019 Toyota Fortuner</span></div>
          <div style={{ position: "relative", height: 230, borderRadius: 14, overflow: "hidden" }}>
            <Photo src="cars/fortuner-white-2019-2.jpg" h={230} />
            {[{ I: IconChevronLeft, l: 10 }, { I: IconChevronRight, r: 10 }].map(({ I, l, r }, i) => (
              <span key={i} style={{ position: "absolute", top: 97, left: l, right: r, width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}><I size={18} /></span>
            ))}
            <span style={{ position: "absolute", right: 10, bottom: 10, background: "rgba(255,255,255,0.92)", borderRadius: 999, padding: "4px 9px", fontSize: 12, fontWeight: 700, color: C.ink, display: "flex", alignItems: "center", gap: 4 }}><IconZoomIn size={13} />2/8</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 21, fontWeight: 800, color: C.inkStrong, letterSpacing: "-0.02em" }}>2019 Toyota Fortuner</div>
              <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>Asking Price</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.brand, letterSpacing: "-0.02em" }}>TZS 145,000,000</div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {[IconHeart, IconShare, IconFlag].map((I, i) => <span key={i} style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink, background: C.card }}><I size={16} /></span>)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
            {spec.map(({ I, k, v }) => (
              <div key={k} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 11px", height: 52, boxSizing: "border-box" }}>
                <div style={{ fontSize: 11.5, color: C.brand, display: "flex", alignItems: "center", gap: 4 }}><I size={13} />{k}</div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: C.inkStrong, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: C.brandSoft, color: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>A</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.inkStrong }}>Amani Motors</div>
                <div style={{ fontSize: 12.5, color: C.ok, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><IconShieldCheck size={14} />Verified dealer</div>
              </div>
            </div>
            <div style={{ height: 46, borderRadius: 10, background: pressed ? C.brandInk : C.brand, color: "#fff", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transform: pressed ? "scale(0.97)" : "none" }}><IconMessage size={19} />Message on Motokah</div>
            <div style={{ height: 36, marginTop: 8, borderRadius: 10, border: `1px solid ${C.border}`, color: C.inkSoft, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><IconPhone size={15} />Or call seller</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}><AppHeader back /></div>
      <BottomNav active={null} />
    </Screen>
  );
}

export function Chapter5ContactSeller() {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [F.scrollA, F.scrollB], [0, SCROLL], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const sent = frame >= F.send + 2;

  return (
    <Scene
      step={5}
      title="Message the seller"
      line="Chat inside Motokah. No need to share your number."
      shots={[
        { f: 0, x: 180, y: 300, z: 1 },
        { f: F.scrollA, x: 180, y: 300, z: 1 },
        { f: F.scrollB, x: 180, y: 300, z: 1 },
        { f: F.msgTap - 4, x: 180, y: MSG_Y - 30, z: 1.18 },
        { f: F.push + 2, x: 180, y: MSG_Y - 30, z: 1.18 },
        { f: F.push + 16, x: 180, y: 300, z: 1 },
        { f: F.type - 4, x: 180, y: 300, z: 1 },
        { f: F.type + 6, x: 180, y: 470, z: 1.08 },
        { f: F.send + 6, x: 180, y: 470, z: 1.08 },
        { f: F.dots + 8, x: 180, y: 380, z: 1.1 },
      ]}
      taps={[{ frame: F.msgTap, x: 180, y: MSG_Y }, { frame: F.type - 6, x: 150, y: CHAT_SEND.y }, { frame: F.send, x: CHAT_SEND.x, y: CHAT_SEND.y }]}
    >
      <Push
        frame={frame}
        a={F.push}
        b={F.push + 14}
        from={<DetailScreen scroll={scroll} pressed={frame >= F.msgTap && frame < F.msgTap + 6} />}
        to={
          <ChatScreen
            frame={frame}
            name="Amani Motors"
            listing="2019 Toyota Fortuner, TZS 145,000,000"
            photo="cars/fortuner-white-2019-1.jpg"
            typing={frame >= F.type - 6 && !sent}
            input={!sent && frame >= F.type ? <Typed text="Hi, is this still available?" start={F.type} cps={0.85} /> : undefined}
            typingDotsAt={[F.dots, F.reply]}
            bubbles={[
              { me: true, text: "Hi, is this still available?", at: F.send + 2, time: "10:24" },
              { me: false, text: "Yes it is. You can view it in Dar es Salaam any day this week.", at: F.reply, time: "10:25" },
            ]}
          />
        }
      />
    </Scene>
  );
}

export const CHAPTER5_DURATION = 195;
