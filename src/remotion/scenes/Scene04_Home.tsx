import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";
import { HomeScreen } from "../components/screens/HomeScreen";
import { PhoneFrame } from "../components/PhoneFrame";

export function Scene04_Home() {
  const frame = useCurrentFrame();

  const titleSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.main,
  });

  const phoneSpring = spring({
    frame: Math.max(0, frame - 10),
    fps: 30,
    config: SPRING.cinematic,
  });

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 55) / 15);

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
      {/* Left text */}
      <div style={{ flex: 1, maxWidth: 440 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: COLOR.brand,
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 16,
            opacity: titleSpring,
            transform: `translate3d(0, ${(1 - titleSpring) * 15}px, 0)`,
            filter: `blur(${(1 - titleSpring) * 4}px)`,
          }}
        >
          For Sellers
        </div>

        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: COLOR.ink,
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 16,
            opacity: titleSpring,
            transform: `translate3d(0, ${(1 - titleSpring) * 20}px, 0)`,
            filter: `blur(${(1 - titleSpring) * 6}px)`,
          }}
        >
          Post your car
          <br />
          in <span style={{ color: COLOR.brand }}>2 minutes</span>.
        </div>

        <div
          style={{
            fontSize: 15,
            color: COLOR.ok,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            marginTop: 12,
            opacity: titleSpring,
          }}
        >
          ✓ Completely free. Forever.
        </div>
      </div>

      {/* Right: Phone with HomeScreen */}
      <div
        style={{
          opacity: phoneSpring,
          transform: `translate3d(${(1 - phoneSpring) * 40}px, 0, 0) rotate(${(1 - phoneSpring) * 5}deg)`,
          filter: `blur(${(1 - phoneSpring) * 8}px)`,
        }}
      >
        <PhoneFrame width={240} height={480} tilt={-3}>
          <HomeScreen frame={Math.max(0, frame - 8)} showTyping={true} />
        </PhoneFrame>
      </div>
    </div>
  );
}
