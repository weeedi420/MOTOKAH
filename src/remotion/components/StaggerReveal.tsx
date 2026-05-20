import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../design";

interface StaggerRevealProps {
  children: React.ReactNode;
  startFrame: number;
  staggerFrames?: number;
  distance?: number;
}

export function StaggerReveal({
  children,
  startFrame,
  staggerFrames = 4,
  distance = 16,
}: StaggerRevealProps) {
  const frame = useCurrentFrame();
  const kids = React.Children.toArray(children);

  return (
    <>
      {kids.map((child, i) => {
        const f = frame - startFrame - i * staggerFrames;
        const opacity = interpolate(f, [0, 20], [0, 1], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: EASE,
        });
        const y = interpolate(f, [0, 20], [distance, 0], {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
          easing: EASE,
        });
        return (
          <div key={i} style={{ transform: `translateY(${y}px)`, opacity }}>
            {child}
          </div>
        );
      })}
    </>
  );
}
