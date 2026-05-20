import { Easing, spring } from "remotion";

// CINEMATIC COLOR GRADE - warm golden African tones, high contrast
export const COLOR = {
  bg:        "#0A0A0F",        // Deep cinematic black
  bgWarm:    "#14121C",        // Warm dark
  surface:   "#1A1A24",        // Elevated dark surface
  border:    "#2A2A35",        // Subtle borders
  ink:       "#FFFFFF",        // Pure white for headlines
  inkSoft:   "#B8B4C8",        // Warm gray for body
  inkMute:   "#6B6678",        // Muted text
  brand:     "#F5A623",        // Warm golden amber (African sun)
  brandSoft: "#F5A62320",      // Amber with opacity
  brandGlow: "#F5A62340",      // Amber glow
  accent:    "#00D4FF",        // Cyan accent for UI highlights
  accentSoft:"#00D4FF20",
  ok:        "#34D399",
  depthBlur: "rgba(10,10,15,0.4)", // Depth of field blur
};

export const SHADOW = {
  card:  "0 4px 24px rgba(0,0,0,0.4)",
  lift:  "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(245,166,35,0.1)",
  brand: "0 0 60px rgba(245,166,35,0.3), 0 4px 20px rgba(245,166,35,0.2)",
  glow:  "0 0 80px rgba(245,166,35,0.15)",
};

export const RADIUS = { sm: 8, md: 12, lg: 20, xl: 28, phone: 44 };

// CINEMATIC EASING
export const EASE = {
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  inOutCubic: Easing.bezier(0.65, 0, 0.35, 1),
  outQuart: Easing.bezier(0.25, 1, 0.5, 1),
  springy: Easing.bezier(0.34, 1.56, 0.64, 1),
};

// SPRING CONFIGS - no linear interpolation anywhere
export const SPRING = {
  // Bouncy but controlled - for main elements
  main: { stiffness: 120, damping: 15, mass: 1 },
  // Tight snap - for UI interactions
  snap: { stiffness: 200, damping: 20, mass: 0.8 },
  // Slow cinematic - for camera movements
  cinematic: { stiffness: 60, damping: 12, mass: 1.5 },
  // Gentle float - for background elements
  float: { stiffness: 80, damping: 8, mass: 2 },
  // Fast punch - for impact moments
  punch: { stiffness: 300, damping: 18, mass: 0.6 },
  // Elastic - for playful elements
  elastic: { stiffness: 150, damping: 10, mass: 1.2 },
};

// HELPER: Spring-based opacity + transform (Apple-style blur-to-sharp reveal)
export function appleReveal(
  frame: number,
  startFrame: number,
  duration: number = 20,
  direction: "up" | "down" | "left" | "right" = "up"
) {
  const t = Math.max(0, Math.min(1, (frame - startFrame) / duration));
  const s = spring({
    frame: t * 30,
    fps: 30,
    config: SPRING.main,
  });

  const distance = 30;
  const yOffset = direction === "up" ? distance : direction === "down" ? -distance : 0;
  const xOffset = direction === "left" ? distance : direction === "right" ? -distance : 0;

  return {
    opacity: s,
    transform: `translate3d(${xOffset * (1 - s)}px, ${yOffset * (1 - s)}px, 0)`,
    filter: `blur(${(1 - s) * 8}px)`,
  };
}

// HELPER: Camera zoom effect (scale 1.08 → 1.0)
export function cameraZoom(
  frame: number,
  startFrame: number,
  duration: number = 60
) {
  const t = Math.max(0, Math.min(1, (frame - startFrame) / duration));
  const s = spring({
    frame: t * 30,
    fps: 30,
    config: SPRING.cinematic,
  });

  return 1.08 - (0.08 * s);
}

// HELPER: Camera punch in (scale 1.0 → 1.15 → 1.0)
export function cameraPunch(
  frame: number,
  punchFrame: number
) {
  const t = Math.max(0, frame - punchFrame);
  const s = spring({
    frame: t,
    fps: 30,
    config: SPRING.punch,
  });

  return 1 + (0.15 * s * Math.max(0, 1 - t / 20));
}

// HELPER: Staggered word reveal
export function wordReveal(
  frame: number,
  words: string[],
  startFrame: number,
  stagger: number = 3
) {
  return words.map((_, i) => {
    const t = Math.max(0, Math.min(1, (frame - (startFrame + i * stagger)) / 12));
    const s = spring({
      frame: t * 30,
      fps: 30,
      config: SPRING.snap,
    });

    return {
      word: words[i],
      opacity: s,
      transform: `translate3d(0, ${(1 - s) * 20}px, 0)`,
      filter: `blur(${(1 - s) * 6}px)`,
    };
  });
}

// HELPER: Cursor glow click effect
export function cursorGlow(
  frame: number,
  clickFrame: number
) {
  const t = Math.max(0, frame - clickFrame);
  const s = spring({
    frame: t,
    fps: 30,
    config: SPRING.snap,
  });

  return {
    scale: 1 + (0.5 * s * Math.max(0, 1 - t / 15)),
    opacity: s * Math.max(0, 1 - t / 20),
  };
}

// HELPER: Motion blur for fast transitions
export function motionBlur(
  frame: number,
  velocity: number // pixels per frame
) {
  const blurAmount = Math.min(8, Math.abs(velocity) * 0.3);
  return `blur(${blurAmount}px)`;
}

// HELPER: Depth of field - background blur
export const depthOfField = {
  background: "blur(2px) brightness(0.7)",
  midground: "blur(1px) brightness(0.85)",
  foreground: "blur(0px)",
};

// HELPER: Golden hour color grade overlay
export const colorGrade = {
  warmOverlay: "linear-gradient(135deg, rgba(245,166,35,0.03) 0%, transparent 50%, rgba(0,212,255,0.02) 100%)",
  vignette: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
};
