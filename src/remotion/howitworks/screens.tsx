import React from "react";
import { staticFile } from "remotion";
import { IconSearch, IconChevronDown, IconFilter, IconBookmark, IconX, IconSortDescending, IconArrowLeft, IconSend, IconChecks, IconMapPin, IconFlame, IconArrowRight } from "@/components/icons";
import { AppHeader, BottomNav, ListingCard, Photo, C, Screen, NAV_H, APP_H } from "./kit";

// Real copy from LanguageContext.tsx (en + sw).
const COPY = {
  en: { title: "Find Used Cars in", cars: "Cars", commercial: "Commercial", bikes: "Bikes", search: "Search used cars...", btn: "Search", adv: "Advanced search", browse: "Browse Used Cars", cat: "Category", postAd: "Post Ad", deals: "Hot Deals & Featured", all: "View All" },
  sw: { title: "Pata Magari ya Kutumika", cars: "Magari", commercial: "Biashara", bikes: "Pikipiki", search: "Tafuta magari...", btn: "Tafuta", adv: "Utafutaji wa Kina", browse: "Vinjari Magari", cat: "Aina", postAd: "Tangaza", deals: "Ofa Bora", all: "Zote" },
};

const CATEGORIES = [
  { name: "Saloon", icon: "icons/sedan.png" },
  { name: "4x4 / SUV", icon: "icons/suv.png" },
  { name: "Double Cab", icon: "icons/pickup.png" },
  { name: "Small Car", icon: "icons/hatchback.png" },
];

// Category tile centres (for taps / camera), in app coordinates.
export const HOME_TILE = (i: number) => ({ x: 12 + i * 86 + 39, y: 438 });
export const HOME_MENU = { x: 337, y: 57 };
export const HOME_BELL = { x: 205, y: 57 };
export const NAV_SELL = { x: 180, y: 556 };
export const NAV_MYADS = { x: 108, y: 568 };

// Home (src/pages/Index.tsx): HeroSearch + Browse Used Cars, or the featured row.
export function HomeScreen({ lang = "en", picked = -1, section = "browse", badge = 0, price = "TZS 145,000,000", typed }: {
  lang?: "en" | "sw"; picked?: number; section?: "browse" | "deals"; badge?: number; price?: string; typed?: React.ReactNode;
}) {
  const t = COPY[lang];
  return (
    <Screen>
      <AppHeader badge={badge} postAd={t.postAd} />
      <div style={{ background: "linear-gradient(180deg, #EEF3F9 0%, #F9FAFB 100%)", padding: "18px 12px 14px" }}>
        <div style={{ textAlign: "center", fontSize: lang === "sw" ? 22 : 25, fontWeight: 900, color: C.inkStrong, letterSpacing: "-0.03em", lineHeight: 1.12, marginBottom: 14 }}>
          {t.title} <span style={{ color: C.brand }}>Tanzania</span>
        </div>
        <div style={{ background: C.card, borderRadius: 14, boxShadow: "0 8px 24px rgba(27,42,56,0.10)", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
            {[t.cars, t.commercial, t.bikes].map((x, i) => (
              <div key={x} style={{ flex: 1, textAlign: "center", padding: "11px 0", fontSize: 14, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? C.brand : C.inkSoft, borderBottom: i === 0 ? `2px solid ${C.brand}` : "2px solid transparent", background: i === 0 ? C.brandSoft : "transparent" }}>{x}</div>
            ))}
          </div>
          <div style={{ padding: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, height: 44, border: `1px solid ${C.border}`, borderRadius: 9, display: "flex", alignItems: "center", gap: 8, padding: "0 11px", fontSize: 14.5, color: C.inkMute }}>
                <IconSearch size={17} /> {typed ?? t.search}
              </div>
              <div style={{ height: 44, padding: "0 16px", borderRadius: 9, background: C.brand, color: "#fff", fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center" }}>{t.btn}</div>
            </div>
            <div style={{ fontSize: 12.5, color: C.brand, fontWeight: 600, marginTop: 9, display: "flex", alignItems: "center", gap: 3 }}><IconChevronDown size={13} />{t.adv}</div>
          </div>
        </div>
      </div>

      {section === "browse" ? (
        <div style={{ padding: "6px 12px 0" }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: C.inkStrong, marginBottom: 10 }}>{t.browse}</div>
          <div style={{ display: "flex", gap: 18, borderBottom: `1px solid ${C.border}`, marginBottom: 12, fontSize: 13.5 }}>
            {[t.cat, "Budget", "Model", "Cities", "Location"].map((x, i) => (
              <span key={x} style={{ paddingBottom: 7, color: i === 0 ? C.brand : C.inkSoft, fontWeight: i === 0 ? 700 : 500, borderBottom: i === 0 ? `2px solid ${C.brand}` : "none" }}>{x}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {CATEGORIES.map((c, i) => {
              const on = picked === i;
              return (
                <div key={c.name} style={{ width: 78, height: 80, borderRadius: 12, boxSizing: "border-box", border: `${on ? 2 : 1}px solid ${on ? C.brand : C.border}`, background: on ? C.brandSoft : C.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, transform: on ? "scale(0.96)" : "none" }}>
                  <img src={staticFile(c.icon)} alt="" style={{ width: 36, height: 30, objectFit: "contain" }} />
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: on ? C.brandInk : C.ink }}>{c.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ padding: "6px 12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.inkStrong, display: "flex", alignItems: "center", gap: 6 }}><IconFlame size={20} style={{ color: "#F97316" }} />{t.deals}</div>
            <div style={{ fontSize: 13, color: C.brand, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>{t.all}<IconArrowRight size={13} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ width: 130, flexShrink: 0 }}><Photo src="cars/fortuner-white-2019-1.jpg" h={112} /></div>
            <div style={{ padding: "10px 10px 10px 0", minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: C.inkStrong, marginBottom: 4 }}>2019 Toyota Fortuner</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.brand, marginBottom: 6 }}>{price}</div>
              <div style={{ fontSize: 12, color: C.inkSoft, display: "flex", alignItems: "center", gap: 4 }}><IconMapPin size={13} />Dar es Salaam</div>
            </div>
          </div>
        </div>
      )}
      <BottomNav active="Home" />
    </Screen>
  );
}

// SearchResults.tsx: search bar, title, count, Filters / Save / sort, active chips, cards.
export function SearchScreen({ title, count, chips, query, queryActive, children }: {
  title: string; count: string; chips: string[]; query?: React.ReactNode; queryActive?: boolean; children?: React.ReactNode;
}) {
  return (
    <Screen>
      <AppHeader back />
      <div style={{ padding: "12px 12px 0" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 46, border: `${queryActive ? 2 : 1}px solid ${queryActive ? C.brand : C.border}`, boxShadow: queryActive ? "0 0 0 4px rgba(0,102,204,0.13)" : "none", borderRadius: 10, background: C.card, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 15, color: C.inkStrong, boxSizing: "border-box" }}>
            {query ?? <span style={{ color: C.inkMute }}>Search make, model or keyword</span>}
          </div>
          <div style={{ width: 46, height: 46, borderRadius: 10, background: C.brand, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><IconSearch size={20} /></div>
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: C.inkStrong }}>{title}</div>
        <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 10 }}>{count}</div>
        <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
          <span style={{ height: 36, padding: "0 11px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.card, display: "flex", alignItems: "center", gap: 5, fontSize: 13.5, fontWeight: 600, color: C.ink }}><IconFilter size={15} />Filters</span>
          <span style={{ height: 36, padding: "0 11px", border: `1px solid ${C.brand}`, borderRadius: 8, background: C.brandSoft, display: "flex", alignItems: "center", gap: 5, fontSize: 13.5, fontWeight: 600, color: C.brand }}><IconBookmark size={15} />Save</span>
          <span style={{ height: 36, padding: "0 11px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.card, display: "flex", alignItems: "center", gap: 5, fontSize: 13.5, fontWeight: 600, color: C.ink }}><IconSortDescending size={15} />Newest First</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          {chips.map((c) => (
            <span key={c} style={{ fontSize: 12.5, fontWeight: 600, padding: "4px 9px", borderRadius: 999, background: C.brandSoft, color: C.brand, display: "flex", alignItems: "center", gap: 4 }}>{c}<IconX size={12} /></span>
          ))}
          {chips.length > 0 && <span style={{ fontSize: 12.5, color: C.inkSoft, textDecoration: "underline" }}>Clear all</span>}
        </div>
        {children}
      </div>
      <BottomNav active={null} />
    </Screen>
  );
}

export interface Bubble { me: boolean; text: string; at: number; time: string }

// Messages.tsx conversation view.
export function ChatScreen({ frame, name, listing, photo, bubbles, typing, input, typingDotsAt }: {
  frame: number; name: string; listing: string; photo: string; bubbles: Bubble[]; typing?: boolean; input?: React.ReactNode; typingDotsAt?: [number, number];
}) {
  const shown = bubbles.filter((b) => frame >= b.at);
  const dots = typingDotsAt && frame >= typingDotsAt[0] && frame < typingDotsAt[1];
  return (
    <Screen bg="#EEF2F6">
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ height: 30 }} />
        <div style={{ height: 58, display: "flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
          <IconArrowLeft size={22} style={{ color: C.ink }} />
          <div style={{ width: 38, height: 38, borderRadius: 19, background: C.brand, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>{name[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.inkStrong }}>{name}</div>
            <div style={{ fontSize: 12, color: C.ok, fontWeight: 600 }}>Online</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
          <div style={{ width: 52, height: 38, borderRadius: 7, overflow: "hidden", flexShrink: 0 }}><Photo src={photo} h={38} /></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{listing}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, bottom: 64, padding: "12px 12px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8 }}>
        {shown.map((b, i) => {
          const o = Math.min(1, (frame - b.at) / 6);
          return (
            <div key={i} style={{ alignSelf: b.me ? "flex-end" : "flex-start", maxWidth: "78%", opacity: o, transform: `translateY(${(1 - o) * 10}px) scale(${0.96 + o * 0.04})`, transformOrigin: b.me ? "bottom right" : "bottom left" }}>
              <div style={{ background: b.me ? C.brand : C.card, color: b.me ? "#fff" : C.inkStrong, padding: "10px 13px", borderRadius: 16, borderBottomRightRadius: b.me ? 4 : 16, borderBottomLeftRadius: b.me ? 16 : 4, fontSize: 15, lineHeight: 1.35, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>{b.text}</div>
              <div style={{ fontSize: 10.5, color: C.inkMute, marginTop: 3, textAlign: b.me ? "right" : "left", display: "flex", gap: 3, justifyContent: b.me ? "flex-end" : "flex-start", alignItems: "center" }}>{b.time}{b.me && <IconChecks size={13} style={{ color: C.brand }} />}</div>
            </div>
          );
        })}
        {dots && (
          <div style={{ alignSelf: "flex-start", background: C.card, borderRadius: 16, padding: "12px 14px", display: "flex", gap: 4 }}>
            {[0, 1, 2].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 4, background: C.inkMute, opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame / 6) + i)) }} />)}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: APP_H - NAV_H, height: NAV_H, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
        <div style={{ flex: 1, height: 42, borderRadius: 21, background: C.muted, border: typing ? `2px solid ${C.brand}` : `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 15, color: C.inkStrong, boxSizing: "border-box" }}>
          {input ?? <span style={{ color: C.inkMute }}>Type a message...</span>}
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 21, background: C.brand, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><IconSend size={19} /></div>
      </div>
    </Screen>
  );
}
export const CHAT_SEND = { x: 327, y: 568 };

export { ListingCard };
