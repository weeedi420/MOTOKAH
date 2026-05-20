import React from "react";
import { COLOR, RADIUS } from "../design";

interface PhoneFrameProps {
  width?: number;
  height?: number;
  tilt?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function PhoneFrame({ width = 260, height = 520, tilt = 0, children, style }: PhoneFrameProps) {
  const bezel = 12;
  const notchW = 70;
  const notchH = 20;

  const transform = tilt !== 0
    ? `perspective(2000px) rotateY(${-tilt}deg) rotateX(2deg)`
    : undefined;

  return (
    <div style={{
      width,
      height,
      borderRadius: 32,
      background: COLOR.ink,
      border: `2px solid ${COLOR.border}`,
      boxShadow: "0 25px 60px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)",
      position: "relative",
      overflow: "hidden",
      transform,
      transformOrigin: "center center",
      ...style,
    }}>
      {/* Notch */}
      <div style={{
        position: "absolute",
        top: 8,
        left: "50%",
        transform: "translateX(-50%)",
        width: notchW,
        height: notchH,
        background: COLOR.ink,
        borderRadius: 99,
        zIndex: 10,
      }} />

      {/* Screen content */}
      <div style={{
        position: "absolute",
        inset: bezel,
        borderRadius: 24,
        overflow: "hidden",
        background: COLOR.surface,
      }}>
        {children}
      </div>

      {/* Home indicator */}
      <div style={{
        position: "absolute",
        bottom: 6,
        left: "50%",
        transform: "translateX(-50%)",
        width: 45,
        height: 3,
        background: "rgba(255,255,255,0.3)",
        borderRadius: 99,
        zIndex: 10,
      }} />
    </div>
  );
}
