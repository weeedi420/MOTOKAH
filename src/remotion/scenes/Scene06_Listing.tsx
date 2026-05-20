import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";
import { DetailScreen } from "../components/screens/DetailScreen";
import { PhoneFrame } from "../components/PhoneFrame";

export function Scene06_Listing() {
  const frame = useCurrentFrame();

  const textSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.main,
  });

  const phoneSpring = spring({
    frame: Math.max(0, frame - 10),
    fps: 30,
    config: SPRING.cinematic,
  });

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 100) / 15);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
        padding: "0 80px",
        opacity: fadeOut,
      }}
    >
      {/* Left: "No middlemen" text */}
      <div style={{ flex: 1, padding: "0 60px" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: COLOR.brand,
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 20,
            opacity: textSpring,
            transform: `translate3d(0, ${(1 - textSpring) * 15}px, 0)`,
            filter: `blur(${(1 - textSpring) * 4}px)`,
          }}
        >
          Direct Contact
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            color: COLOR.ink,
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 20,
            opacity: textSpring,
            transform: `translate3d(0, ${(1 - textSpring) * 20}px, 0)`,
            filter: `blur(${(1 - textSpring) * 6}px)`,
          }}
        >
          No middlemen.
          <br />
          No commission.
        </div>
        <div
          style={{
            fontSize: 16,
            color: COLOR.inkSoft,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.5,
            opacity: textSpring,
            transform: `translate3d(0, ${(1 - textSpring) * 10}px, 0)`,
            filter: `blur(${(1 - textSpring) * 3}px)`,
          }}
        >
          Contact the seller directly
          <br />
          via WhatsApp or call.
        </div>
      </div>

      {/* Right: DetailScreen in phone frame */}
      <div
        style={{
          opacity: phoneSpring,
          transform: `translate3d(${(1 - phoneSpring) * 40}px, 0, 0) rotate(${(1 - phoneSpring) * 5}deg)`,
          filter: `blur(${(1 - phoneSpring) * 8}px)`,
        }}
      >
        <PhoneFrame width={240} height={480} tilt={-3}>
          <DetailScreen frame={Math.max(0, frame - 10)} />
        </PhoneFrame>
      </div>
    </div>
  );
}
