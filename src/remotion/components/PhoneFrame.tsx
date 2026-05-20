import React from "react";
import { COLOR, RADIUS, SHADOW } from "../design";

interface PhoneFrameProps {
  width?: number;
  height?: number;
  tilt?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function PhoneFrame({ width = 320, height = 680, tilt = 0, children, style }: PhoneFrameProps) {
  const bezel = 14;
  const notchW = 80;
  const notchH = 22;

  const transform = tilt !== 0
    ? `perspective(2000px) rotateY(${-tilt}deg) rotateX(2deg)`
    : undefined;

  return (
    <div style={{
      width,
      height,
      borderRadius: RADIUS.phone,
      background: COLOR.bg,
      border: `1px solid ${COLOR.border}`,
      boxShadow: SHADOW.lift,
      position: "relative",
      overflow: "hidden",
      transform,
      transformOrigin: "center center",
      ...style,
    }}>
      {/* Notch */}
      <div style={{
        position: "absolute",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        width: notchW,
        height: notchH,
        background: COLOR.ink,
        borderRadius: 99,
        zIndex: 10,
      }} />

      {/* Screen content — inset from bezel */}
      <div style={{
        position: "absolute",
        inset: bezel,
        borderRadius: RADIUS.phone - bezel,
        overflow: "hidden",
        background: COLOR.surface,
      }}>
        {children}
      </div>

      {/* Home indicator */}
      <div style={{
        position: "absolute",
        bottom: 8,
        left: "50%",
        transform: "translateX(-50%)",
        width: 50,
        height: 3,
        background: COLOR.ink,
        borderRadius: 99,
        opacity: 0.25,
        zIndex: 10,
      }} />

      {/* Volume rocker */}
      <div style={{
        position: "absolute",
        left: -2,
        top: 120,
        width: 3,
        height: 40,
        background: COLOR.border,
        borderRadius: 99,
      }} />
      <div style={{
        position: "absolute",
        left: -2,
        top: 175,
        width: 3,
        height: 40,
        background: COLOR.border,
        borderRadius: 99,
      }} />

      {/* Power button */}
      <div style={{
        position: "absolute",
        right: -2,
        top: 150,
        width: 3,
        height: 56,
        background: COLOR.border,
        borderRadius: 99,
      }} />
    </div>
  );
}
