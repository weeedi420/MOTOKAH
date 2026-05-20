import { interpolate, useCurrentFrame } from "../frame";

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: 100 + Math.random() * 20,
  size: 1 + Math.random() * 2.5,
  speed: 0.015 + Math.random() * 0.025,
  delay: Math.random() * 80,
  opacity: 0.2 + Math.random() * 0.5,
}));

export function ParticleField({ startFrame = 0 }: { startFrame?: number }) {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {PARTICLES.map((p) => {
        const localFrame = Math.max(0, elapsed - p.delay);
        const progress = localFrame * p.speed;
        const y = p.y - (progress * 120) % 130;
        const fadeIn = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: `rgba(0, 153, 255, ${p.opacity * fadeIn})`,
              boxShadow: `0 0 ${p.size * 3}px rgba(0,212,255,0.6)`,
            }}
          />
        );
      })}
    </div>
  );
}
