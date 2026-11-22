import React from "react";
import { IconArrowLeft, IconCamera, IconCheck, IconX } from "@/components/icons";
import { AppHeader, C, Label, Input, Photo, Screen, HEADER_H } from "./kit";

// src/pages/SellCar.tsx, recreated. Content is laid out on fixed rows so taps
// and camera moves can target exact spots; `scroll` slides it like a real page.
export const MAKES = ["Toyota", "Nissan", "Subaru", "Honda", "Mercedes-Benz", "BMW", "Mitsubishi", "Land Rover"];
export const BODY = ["SUV / 4x4", "Sedan / Saloon", "Hatchback", "Pickup / Double Cab", "Van / Minivan", "Wagon"];

// Content-space anchors (add HEADER_H and subtract scroll for screen y).
export const SELL = {
  chooseBtn: { x: 180, y: 247 },
  make: (i: number) => ({ x: 26 + (i % 4) * 78.5 + 36, y: 399 + Math.floor(i / 4) * 42 }),
  model: { x: 180, y: 563 },
  year: { x: 180, y: 643 },
  body: (i: number) => ({ x: i % 2 === 0 ? 101 : 259, y: 722 + Math.floor(i / 2) * 52 }),
  price: { x: 180, y: 907 },
  submit: { x: 180, y: 985 },
};
export const toScreen = (p: { x: number; y: number }, scroll: number) => ({ x: p.x, y: p.y + HEADER_H - scroll });

export function SellScreen({ scroll = 0, make, model, year, body, price, focus, photos = [], photoIn, submitPressed }: {
  scroll?: number; make?: string; model?: React.ReactNode; year?: React.ReactNode; body?: string; price?: React.ReactNode;
  focus?: "model" | "year" | "price"; photos?: string[]; photoIn?: (i: number) => number; submitPressed?: boolean;
}) {
  return (
    <Screen>
      <div style={{ position: "absolute", left: 0, right: 0, top: HEADER_H, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -scroll }}>
          {/* Title block */}
          <div style={{ height: 76, display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
            <span style={{ height: 32, padding: "0 10px", border: `1px solid ${C.border}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: C.ink, background: C.card }}><IconArrowLeft size={14} />Back</span>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: C.inkStrong }}>Post Your Vehicle</div>
              <div style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.3 }}>Reach thousands of active car buyers across East Africa</div>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: C.brand, background: C.brandSoft, padding: "4px 7px", borderRadius: 6 }}>FREE AD</span>
          </div>

          {/* 1 Photos & Video: content y 80..306 */}
          <div style={{ position: "absolute", left: 12, right: 12, top: 80, height: 226, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, background: C.brandSoft, color: C.brand, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.inkStrong, flex: 1 }}>Photos &amp; Video</span>
              <span style={{ fontSize: 12.5, color: C.inkSoft }}>{photos.length}/10 photos</span>
            </div>
            {photos.length === 0 ? (
              <div style={{ height: 160, border: `2px dashed ${C.border}`, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ width: 42, height: 42, borderRadius: 21, background: C.brandSoft, color: C.brand, display: "flex", alignItems: "center", justifyContent: "center" }}><IconCamera size={22} /></span>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: C.inkStrong }}>Upload Photos of Your Car</div>
                <div style={{ background: C.brand, color: "#fff", fontSize: 13.5, fontWeight: 700, padding: "9px 14px", borderRadius: 8, marginTop: 2 }}>Choose Photos (Up to 10)</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                {photos.map((p, i) => {
                  const o = photoIn ? photoIn(i) : 1;
                  return (
                    <div key={p} style={{ position: "relative", height: 74, borderRadius: 10, overflow: "hidden", opacity: o, transform: `scale(${0.85 + 0.15 * o})`, border: `1px solid ${C.border}` }}>
                      <Photo src={p} h={74} />
                      <span style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 10, background: "rgba(0,0,0,0.7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><IconX size={11} /></span>
                      {i === 0 && <span style={{ position: "absolute", left: 4, bottom: 4, fontSize: 9.5, fontWeight: 800, background: C.brand, color: "#fff", padding: "2px 5px", borderRadius: 4 }}>Cover Photo</span>}
                    </div>
                  );
                })}
                {photos.length < 6 && (
                  <div style={{ height: 74, borderRadius: 10, border: `2px dashed ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.inkSoft, boxSizing: "border-box" }}>
                    <span style={{ fontSize: 22, lineHeight: 1 }}>+</span><span style={{ fontSize: 10.5, fontWeight: 600 }}>Add More</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2 Vehicle Information: content y 316.. */}
          <div style={{ position: "absolute", left: 12, right: 12, top: 316, height: 640, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 14px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 30 }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, background: C.brandSoft, color: C.brand, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.inkStrong }}>Vehicle Information</span>
            </div>
            <div style={{ position: "absolute", left: 14, right: 14, top: 44 }}><Label req>Make (Brand)</Label></div>
            <div style={{ position: "absolute", left: 14, right: 14, top: 64, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {[...MAKES, "More..."].map((m) => {
                const on = make === m;
                return <span key={m} style={{ height: 36, borderRadius: 8, border: `1px solid ${on ? C.brand : C.border}`, background: on ? C.brand : C.card, color: on ? "#fff" : C.ink, fontSize: m.length > 8 ? 10.5 : 12.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>{m}</span>;
              })}
            </div>
            <div style={{ position: "absolute", left: 14, right: 14, top: 204 }}>
              <Label req>Model</Label>
              <Input active={focus === "model"}>{model ?? <span style={{ color: C.inkMute }}>Type the car name, e.g. Harrier</span>}</Input>
            </div>
            <div style={{ position: "absolute", left: 14, right: 14, top: 284 }}>
              <Label req>Year of Manufacture</Label>
              <Input active={focus === "year"}>{year ?? <span style={{ color: C.inkMute }}>e.g. 2019</span>}</Input>
            </div>
            <div style={{ position: "absolute", left: 14, right: 14, top: 364 }}>
              <Label req>Body Type</Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {BODY.map((b) => {
                  const on = body === b;
                  return (
                    <span key={b} style={{ height: 44, borderRadius: 10, border: `${on ? 2 : 1}px solid ${on ? C.brand : C.border}`, background: on ? C.brandSoft : C.card, color: on ? C.brand : C.ink, fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 11px", boxSizing: "border-box" }}>
                      {b}{on && <IconCheck size={16} />}
                    </span>
                  );
                })}
              </div>
            </div>
            <div style={{ position: "absolute", left: 14, right: 14, top: 548 }}>
              <Label req>Asking Price</Label>
              <Input active={focus === "price"}>
                <span style={{ color: C.inkSoft, fontWeight: 700, marginRight: 8 }}>TZS</span>
                {price ?? <span style={{ color: C.inkMute }}>e.g. 25000000</span>}
              </Input>
            </div>
          </div>

          {/* Submit: content y 962..1008 */}
          <div style={{ position: "absolute", left: 12, right: 12, top: 962, height: 48, borderRadius: 12, background: submitPressed ? C.brandInk : C.brand, color: "#fff", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,102,204,0.3)", transform: submitPressed ? "scale(0.97)" : "none" }}>
            Post Listing Now
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}><AppHeader back /></div>
    </Screen>
  );
}
