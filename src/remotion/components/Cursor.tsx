import { interpolate, useCurrentFrame } from "remotion";
import { COLOR } from "../design";

interface CursorKeyframe { frame: number; x: number; y: number; }

interface CursorProps {
  path: CursorKeyframe[];
  clickFrame?: number;
  startFrame?: number;
  hideFrame?: number;
  hoverScale?: number;
}

export function Cursor({ path, clickFrame, startFrame = 0, hideFrame, hoverScale = 1 }: CursorProps) {
  const frame = useCurrentFrame();
  const f = frame - startFrame;

  if (path.length === 0) return null;

  const frames = path.map((p) => p.frame);
  const xs = path.map((p) => p.x);
  const ys = path.map((p) => p.y);

  const x = interpolate(f, frames, xs, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, frames, ys, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Detect if cursor is hovering (not moving much)
  const prevX = f > 0 ? interpolate(f - 1, frames, xs, { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : x;
  const prevY = f > 0 ? interpolate(f - 1, frames, ys, { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : y;
  const isHovering = Math.abs(x - prevX) < 0.5 && Math.abs(y - prevY) < 0.5;
  const cursorScale = isHovering ? hoverScale * 1.15 : hoverScale;

  // Fade in at start, optionally fade out at hideFrame
  const fadeIn  = interpolate(f, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = hideFrame !== undefined
    ? interpolate(f, [hideFrame, hideFrame + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const opacity = fadeIn * fadeOut;

  // Click ring
  const cf = clickFrame !== undefined ? f - clickFrame : -1;
  const ringScale = interpolate(cf, [0, 14], [0, 2.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ringOp    = interpolate(cf, [0, 3, 14], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showRing  = cf >= 0 && cf <= 16;

  // Second ring for double-pulse feel
  const ringScale2 = interpolate(cf, [4, 18], [0, 2.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ringOp2    = interpolate(cf, [4, 8, 18], [0, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showRing2  = cf >= 4 && cf <= 20;

  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      pointerEvents: "none",
      zIndex: 100,
      opacity,
    }}>
      {showRing && (
        <div style={{
          position: "absolute",
          left: -18, top: -18,
          width: 36, height: 36,
          borderRadius: "50%",
          border: `2px solid ${COLOR.brand}`,
          transform: `scale(${ringScale})`,
          opacity: ringOp,
        }} />
      )}
      {showRing2 && (
        <div style={{
          position: "absolute",
          left: -14, top: -14,
          width: 28, height: 28,
          borderRadius: "50%",
          background: `rgba(0,153,255,0.15)`,
          transform: `scale(${ringScale2})`,
          opacity: ringOp2,
        }} />
      )}
      <svg width={16} height={22} viewBox="0 0 16 22" fill="none" style={{ transform: `scale(${cursorScale})`, transformOrigin: "top left" }}>
        <path d="M0 0L0 17L4 13L7 20L9 19L6 12L11 12Z"
          fill="white" stroke={COLOR.ink} strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    </div>
  );
}
