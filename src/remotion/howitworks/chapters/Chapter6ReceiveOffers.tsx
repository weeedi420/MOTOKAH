import { interpolate, useCurrentFrame, spring } from "remotion";
import { IconMessage, IconCheck } from "@/components/icons";
import { Scene, Push, Typed, C, fade } from "../kit";
import { HomeScreen, ChatScreen, HOME_BELL, CHAT_SEND } from "../screens";

const F = { badge: 16, bellTap: 44, panel: 50, itemTap: 82, push: 88, type: 112, send: 150 };

export function Chapter6ReceiveOffers() {
  const frame = useCurrentFrame();
  const panelO = fade(frame, F.panel, 10);
  const pop = spring({ frame: frame - F.badge, fps: 30, config: { stiffness: 260, damping: 12 } });
  const sent = frame >= F.send + 2;

  return (
    <Scene
      step={6}
      title="Get offers from buyers"
      line="You get a notification the moment a buyer messages you."
      shots={[
        { f: 0, x: 180, y: 300, z: 1 },
        { f: F.badge - 4, x: 250, y: 90, z: 1.7 },
        { f: F.bellTap + 4, x: 250, y: 90, z: 1.7 },
        { f: F.panel + 12, x: 196, y: 170, z: 1.18 },
        { f: F.itemTap + 4, x: 196, y: 170, z: 1.18 },
        { f: F.push + 16, x: 180, y: 300, z: 1 },
        { f: F.type - 2, x: 180, y: 300, z: 1 },
        { f: F.type + 8, x: 180, y: 470, z: 1.08 },
        { f: F.send + 8, x: 180, y: 470, z: 1.08 },
        { f: 180, x: 180, y: 380, z: 1.1 },
      ]}
      taps={[{ frame: F.bellTap, x: HOME_BELL.x, y: HOME_BELL.y }, { frame: F.itemTap, x: 190, y: 160 }, { frame: F.type - 6, x: 150, y: CHAT_SEND.y }, { frame: F.send, x: CHAT_SEND.x, y: CHAT_SEND.y }]}
    >
      <Push
        frame={frame}
        a={F.push}
        b={F.push + 14}
        from={
          <>
            <HomeScreen section="deals" badge={frame >= F.badge ? 1 : 0} />
            {frame >= F.badge && frame < F.bellTap && (
              <div style={{ position: "absolute", left: HOME_BELL.x - 2, top: HOME_BELL.y - 14, width: 22, height: 22, borderRadius: 11, border: `2px solid ${C.danger}`, opacity: 1 - interpolate(frame, [F.badge, F.badge + 20], [0, 1], { extrapolateRight: "clamp" }), transform: `scale(${1 + pop})` }} />
            )}
            {panelO > 0 && (
              <div style={{ position: "absolute", left: 40, right: 12, top: 84, background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 16px 40px rgba(27,42,56,0.2)", opacity: panelO, transform: `translateY(${(1 - panelO) * -8}px)`, zIndex: 10, overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", fontSize: 15.5, fontWeight: 700, color: C.inkStrong, borderBottom: `1px solid ${C.border}` }}>Notifications</div>
                <div style={{ display: "flex", gap: 10, padding: "12px 14px", background: frame >= F.itemTap ? "#DCEAFB" : C.brandSoft }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, background: C.brand, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IconMessage size={17} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.inkStrong }}>New message</div>
                    <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.35 }}>A buyer asked about your 2019 Toyota Hilux Double Cab</div>
                    <div style={{ fontSize: 11, color: C.inkMute, marginTop: 3 }}>Just now</div>
                  </div>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: C.brand, marginTop: 6 }} />
                </div>
                <div style={{ display: "flex", gap: 10, padding: "12px 14px" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, background: "#D1FAE5", color: C.okInk, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IconCheck size={17} /></span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.inkStrong }}>Listing approved</div>
                    <div style={{ fontSize: 12.5, color: C.inkSoft }}>Your Toyota Hilux is now live</div>
                  </div>
                </div>
              </div>
            )}
          </>
        }
        to={
          <ChatScreen
            frame={frame}
            name="Juma K."
            listing="2019 Toyota Hilux, TZS 78,500,000"
            photo="cars/hilux-white-2019-1.jpg"
            typing={frame >= F.type - 6 && !sent}
            input={!sent && frame >= F.type ? <Typed text="Come see it on Saturday, we can talk." start={F.type} cps={1} /> : undefined}
            bubbles={[
              { me: false, text: "Hi, I like your Hilux. Would you take TZS 75,000,000?", at: 0, time: "14:02" },
              { me: true, text: "Come see it on Saturday, we can talk.", at: F.send + 2, time: "14:04" },
            ]}
          />
        }
      />
    </Scene>
  );
}

export const CHAPTER6_DURATION = 190;
