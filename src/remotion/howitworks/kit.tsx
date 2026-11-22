import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import { GB, TZ, FR, SA } from "country-flag-icons/react/3x2";
import {
  IconHome, IconSpeakerphone, IconPlus, IconMessage, IconMenu2, IconMoon, IconBell, IconArrowLeft,
  IconMapPin, IconGauge, IconCalendar, IconManualGearbox, IconHeart, IconScale, IconEye,
} from "@/components/icons";
import { TapDot } from "../components/Cursor";

// Shared "real app" kit for the How It Works reel. Screens are recreated from
// the live app (Header, BottomNav, HeroSearch, SearchResults, ListingDetail,
// SellCar, Messages, Profile) on a 360x720 canvas scaled 3x to 1080x2160, so
// text sits at real phone sizes.
export const W = 360;
export const H = 720;
export const SCALE = 3;
export const CAPTION_H = 120;
export const APP_H = H - CAPTION_H; // 600
export const NAV_H = 64;
export const HEADER_H = 30 + 54 + 2; // status bar + header row + blue rule

// Theme tokens from src/index.css (light).
export const C = {
  brand: "#0066CC",
  brandDeep: "#014DC5",
  brandSoft: "#E6F0FA",
  brandInk: "#004B99",
  ink: "#2B3E50",
  inkStrong: "#1B2A38",
  inkSoft: "#67737F",
  inkMute: "#9AA5B1",
  border: "#E2E6EB",
  bg: "#F9FAFB",
  muted: "#F1F3F5",
  card: "#FFFFFF",
  ok: "#10B981",
  okInk: "#059669",
  amber: "#F59E0B",
  danger: "#E5484D",
};

export const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);

export function fade(frame: number, start: number, dur = 12) {
  return interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: outExpo });
}
export function rise(frame: number, start: number, dist = 14, dur = 14) {
  return interpolate(frame, [start, start + dur], [dist, 0], { ...clamp, easing: outExpo });
}
// 0..1 eased progress between two frames.
export function prog(frame: number, a: number, b: number) {
  return interpolate(frame, [a, b], [0, 1], { ...clamp, easing: inOut });
}

// Camera: keyframes of focus point + zoom on the app area, eased between keys,
// clamped so the screen edge never shows.
export interface Shot { f: number; x: number; y: number; z: number }
function cameraAt(frame: number, shots: Shot[]) {
  if (!shots.length) return { x: W / 2, y: APP_H / 2, z: 1 };
  if (frame <= shots[0].f) return shots[0];
  for (let i = 1; i < shots.length; i++) {
    const a = shots[i - 1], b = shots[i];
    if (frame <= b.f) {
      const t = inOut((frame - a.f) / Math.max(1, b.f - a.f));
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
    }
  }
  return shots[shots.length - 1];
}
// Shorthand: wide, then push in on (x,y) around a tap, then back out.
export function pushIn(x: number, y: number, inAt: number, outAt: number, z = 1.7, lead = 22): Shot[] {
  return [
    { f: inAt - lead, x: W / 2, y: APP_H / 2, z: 1 },
    { f: inAt, x, y, z },
    { f: outAt, x, y, z },
    { f: outAt + lead, x: W / 2, y: APP_H / 2, z: 1 },
  ];
}

export interface Tap { frame: number; x: number; y: number }

// One chapter: app viewport (camera + tap ripples) above a fixed caption band.
// Fully drawn from frame 0, so no chapter ever opens on a blank frame.
export function Scene({ step, title, line, shots = [], taps = [], children }: {
  step: number; title: string; line: string; shots?: Shot[]; taps?: Tap[]; children: React.ReactNode;
}) {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame, shots);
  const z = cam.z;
  let tx = W / 2 - cam.x * z;
  let ty = APP_H / 2 - cam.y * z;
  tx = Math.min(0, Math.max(W - W * z, tx));
  ty = Math.min(0, Math.max(APP_H - APP_H * z, ty));

  return (
    <AbsoluteFill style={{ background: C.brandDeep }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${SCALE})`, transformOrigin: "top left", fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: APP_H, overflow: "hidden", background: C.bg }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: W, height: APP_H, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>
            {children}
            {taps.map((t) => {
              const tf = frame - t.frame;
              return tf >= -6 && tf <= 18 ? <TapDot key={t.frame} x={t.x} y={t.y} tf={tf} size={32} /> : null;
            })}
          </div>
        </div>
        <Caption step={step} title={title} line={line} />
      </div>
    </AbsoluteFill>
  );
}

function Caption({ step, title, line }: { step: number; title: string; line: string }) {
  const frame = useCurrentFrame();
  const o = 1;
  const y = 0;
  return (
    <div style={{ position: "absolute", left: 0, top: APP_H, width: W, height: CAPTION_H, background: C.brandDeep, padding: "14px 20px 0", boxSizing: "border-box", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
      <div style={{ opacity: o, transform: `translateY(${y}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: C.brandDeep, background: "#fff", borderRadius: 999, padding: "3px 9px" }}>STEP {step}</span>
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} style={{ width: i + 1 === step ? 14 : 5, height: 5, borderRadius: 3, background: i + 1 <= step ? "#fff" : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        </div>
        <div style={{ fontSize: 25, fontWeight: 900, color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 5 }}>{title}</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)", lineHeight: 1.35 }}>{line}</div>
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <div style={{ height: 30, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", fontSize: 13.5, fontWeight: 700, color: C.inkStrong, background: C.card }}>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
          {[4, 6, 8, 10].map((h) => <span key={h} style={{ width: 3, height: h, background: C.inkStrong, borderRadius: 1 }} />)}
        </span>
        <span style={{ width: 23, height: 11, border: `1.5px solid ${C.inkStrong}`, borderRadius: 3.5, padding: 1, boxSizing: "border-box" }}>
          <span style={{ display: "block", width: "85%", height: "100%", background: C.inkStrong, borderRadius: 1.5 }} />
        </span>
      </span>
    </div>
  );
}

// src/components/Header.tsx on mobile: (back) logo, theme, bell, Post Ad, menu, blue rule.
export function AppHeader({ back = false, badge = 0, postAd = "Post Ad" }: { back?: boolean; badge?: number; postAd?: string }) {
  return (
    <div style={{ background: C.card, borderBottom: `2px solid ${C.brand}`, position: "relative", zIndex: 5 }}>
      <StatusBar />
      <div style={{ height: 54, display: "flex", alignItems: "center", gap: 9, padding: "0 12px" }}>
        {back && <IconArrowLeft size={22} style={{ color: C.ink }} />}
        <img src={staticFile("brand-2026/motokah-logo-horizontal.svg")} alt="" style={{ height: back ? 22 : 25 }} />
        <div style={{ flex: 1 }} />
        <IconMoon size={20} style={{ color: C.inkSoft }} />
        <div style={{ position: "relative", display: "flex" }}>
          <IconBell size={21} style={{ color: C.inkSoft }} />
          {badge > 0 && (
            <span style={{ position: "absolute", top: -5, right: -6, minWidth: 16, height: 16, borderRadius: 8, background: C.danger, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>{badge}</span>
          )}
        </div>
        <div style={{ background: C.brand, color: "#fff", fontSize: 13.5, fontWeight: 700, padding: "8px 11px", borderRadius: 8, whiteSpace: "nowrap" }}>{postAd}</div>
        <IconMenu2 size={22} style={{ color: C.ink }} />
      </div>
    </div>
  );
}

const TABS = [
  { label: "Home", Icon: IconHome },
  { label: "My Ads", Icon: IconSpeakerphone },
  { label: "Sell", Icon: IconPlus, center: true },
  { label: "Chat", Icon: IconMessage },
  { label: "More", Icon: IconMenu2 },
] as const;

// src/components/BottomNav.tsx
export function BottomNav({ active, pressed }: { active: "Home" | "My Ads" | "Chat" | "More" | null; pressed?: "Sell" }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: APP_H - NAV_H, height: NAV_H, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "0 6px 9px", boxSizing: "border-box", zIndex: 6 }}>
      {TABS.map((t) => "center" in t ? (
        <div key={t.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: pressed === "Sell" ? C.brandInk : C.brand, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 18px rgba(0,102,204,0.4)", marginTop: -22, transform: pressed === "Sell" ? "scale(0.94)" : "none" }}>
            <t.Icon size={26} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: C.inkSoft }}>{t.label}</span>
        </div>
      ) : (
        <div key={t.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 50, color: active === t.label ? C.brand : C.inkSoft }}>
          <t.Icon size={22} />
          <span style={{ fontSize: 10.5, fontWeight: 600 }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

const FLAG_SVGS = { GB, TZ, FR, SA };
export function Flag({ code, w = 20 }: { code: keyof typeof FLAG_SVGS; w?: number }) {
  const S = FLAG_SVGS[code];
  return <S title="" style={{ width: w, height: (w * 2) / 3, borderRadius: 3, display: "inline-block", flexShrink: 0, boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }} />;
}

export function Photo({ src, h, radius = 0, fit = "cover", style }: { src: string; h: number | string; radius?: number; fit?: "cover" | "contain"; style?: React.CSSProperties }) {
  return <img src={staticFile(src)} alt="" style={{ width: "100%", height: h, objectFit: fit, display: "block", borderRadius: radius, ...style }} />;
}

export function Chip({ children, on, style }: { children: React.ReactNode; on?: boolean; style?: React.CSSProperties }) {
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999, border: `1px solid ${on ? C.brand : C.border}`, color: on ? C.brand : C.inkSoft, background: on ? C.brandSoft : C.card, ...style }}>{children}</span>
  );
}

// Listing card as in Hot Deals / search results (VehicleCard.tsx).
export function ListingCard({ title, price, city, km, year, gearbox = "Automatic", body = "SUV", fuel = "Diesel", photo, photos = 8, views, style }: {
  title: string; price: string; city: string; km: string; year: string; gearbox?: string; body?: string; fuel?: string;
  photo: string; photos?: number; views?: number; style?: React.CSSProperties;
}) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(27,42,56,0.06)", ...style }}>
      <div style={{ position: "relative" }}>
        <Photo src={photo} h={168} />
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {[IconHeart, IconScale].map((I, i) => (
            <span key={i} style={{ width: 30, height: 30, borderRadius: 15, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}><I size={16} /></span>
          ))}
        </div>
        <span style={{ position: "absolute", left: 10, bottom: 10, background: "rgba(255,255,255,0.92)", borderRadius: 999, padding: "3px 8px", fontSize: 11.5, fontWeight: 700, color: C.ink, display: "flex", alignItems: "center", gap: 4 }}>
          <IconEye size={13} /> {views ?? photos}
        </span>
      </div>
      <div style={{ padding: "11px 13px 13px" }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: C.inkStrong, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.brand, marginBottom: 7, letterSpacing: "-0.01em" }}>{price}</div>
        <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
          <Chip>Used</Chip><Chip>{body}</Chip><Chip>{fuel}</Chip>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.inkSoft, marginBottom: 5 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><IconGauge size={14} />{km}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><IconCalendar size={14} />{year}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><IconManualGearbox size={14} />{gearbox}</span>
        </div>
        <div style={{ fontSize: 12, color: C.inkSoft, display: "flex", alignItems: "center", gap: 4 }}><IconMapPin size={14} />{city}</div>
      </div>
    </div>
  );
}

export function Label({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 7 }}>
      {children}{req && <span style={{ color: C.danger }}> *</span>}
    </div>
  );
}

export function Input({ active, children, h = 46 }: { active?: boolean; children?: React.ReactNode; h?: number }) {
  return (
    <div style={{
      height: h, boxSizing: "border-box", display: "flex", alignItems: "center", padding: "0 13px",
      border: `${active ? 2 : 1}px solid ${active ? C.brand : C.border}`, borderRadius: 10, background: C.card,
      fontSize: 15.5, color: C.inkStrong, boxShadow: active ? "0 0 0 4px rgba(0,102,204,0.13)" : "none",
    }}>
      {children}
    </div>
  );
}

export function Button({ children, pressed, variant = "primary", style }: { children: React.ReactNode; pressed?: boolean; variant?: "primary" | "outline"; style?: React.CSSProperties }) {
  const primary = variant === "primary";
  return (
    <div style={{
      height: 46, borderRadius: 10, background: primary ? (pressed ? C.brandInk : C.brand) : (pressed ? C.muted : C.card),
      color: primary ? "#fff" : C.ink, border: primary ? "none" : `1px solid ${C.border}`, fontSize: 15, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: primary ? "0 6px 16px rgba(0,102,204,0.25)" : "none", transform: pressed ? "scale(0.97)" : "none", ...style,
    }}>
      {children}
    </div>
  );
}

// Typed text with a blinking caret.
export function Typed({ text, start, cps = 0.6, placeholder, caret = true }: { text: string; start: number; cps?: number; placeholder?: string; caret?: boolean }) {
  const frame = useCurrentFrame();
  const f = frame - start;
  if (f < 0) return placeholder ? <span style={{ color: C.inkMute }}>{placeholder}</span> : null;
  const n = Math.min(text.length, Math.floor(f * cps));
  const on = caret && (n < text.length || Math.floor(f / 15) % 2 === 0);
  return (
    <span style={{ whiteSpace: "pre" }}>
      {text.slice(0, n)}
      {caret && <span style={{ display: "inline-block", width: 2, height: 19, background: on ? C.brand : "transparent", marginLeft: 1, verticalAlign: "middle" }} />}
    </span>
  );
}

// shadcn toast, top of screen, clear of the status bar.
export function Toast({ frame, at, title, body }: { frame: number; at: number; title: string; body: string }) {
  if (frame < at) return null;
  const o = fade(frame, at, 10);
  const y = rise(frame, at, -20, 14);
  return (
    <div style={{ position: "absolute", left: 12, right: 12, top: 40, zIndex: 20, opacity: o, transform: `translateY(${y}px)`, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 15px", boxShadow: "0 12px 30px rgba(27,42,56,0.16)" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.inkStrong, marginBottom: 3 }}>{title}</div>
      {body && <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.35 }}>{body}</div>}
    </div>
  );
}

// Horizontal push between two screens (iOS style) over [a,b].
export function Push({ frame, a, b, from, to }: { frame: number; a: number; b: number; from: React.ReactNode; to: React.ReactNode }) {
  const t = prog(frame, a, b);
  if (t <= 0) return <>{from}</>;
  if (t >= 1) return <>{to}</>;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${-t * 30}%)`, filter: `brightness(${1 - t * 0.15})` }}>{from}</div>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - t) * 100}%)`, boxShadow: "-10px 0 30px rgba(0,0,0,0.12)" }}>{to}</div>
    </>
  );
}

export function Screen({ children, bg = C.bg }: { children: React.ReactNode; bg?: string }) {
  return <div style={{ position: "absolute", left: 0, top: 0, width: W, height: APP_H, background: bg, overflow: "hidden" }}>{children}</div>;
}
