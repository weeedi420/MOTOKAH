import { Easing } from "remotion";

export const COLOR = {
  bg:        "#FFFFFF",
  surface:   "#FAFBFC",
  border:    "#E5E7EB",
  ink:       "#0A0F1E",
  inkSoft:   "#5B6478",
  inkMute:   "#9AA2B1",
  brand:     "#0099FF",
  brandSoft: "#E6F4FF",
  brandInk:  "#0066B3",
  ok:        "#10B981",
  okSoft:    "#D1FAE5",
};

export const SHADOW = {
  card:  "0 1px 2px rgba(10,15,30,0.04), 0 8px 24px rgba(10,15,30,0.06)",
  lift:  "0 4px 12px rgba(10,15,30,0.06), 0 24px 48px rgba(10,15,30,0.08)",
  brand: "0 8px 32px rgba(0,153,255,0.18)",
};

export const RADIUS = { sm: 8, md: 12, lg: 20, xl: 28, phone: 44 };

// Out-expo — the one easing curve used everywhere
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// Critically damped spring — no overshoot, no bounce
export const SPRING_CFG = { stiffness: 100, damping: 200, mass: 0.6 };
