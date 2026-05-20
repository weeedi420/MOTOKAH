import { useCurrentFrame, spring } from "remotion";
import { COLOR, SPRING } from "../design";
import { ChatScreen } from "../components/screens/ChatScreen";
import { PhoneFrame } from "../components/PhoneFrame";

export function Scene06b_Chat() {
  const frame = useCurrentFrame();

  const textSpring = spring({
    frame: Math.max(0, frame - 2),
    fps: 30,
    config: SPRING.main,
  });

  const phoneSpring = spring({
    frame: Math.max(0, frame - 15),
    fps: 30,
    config: SPRING.cinematic,
  });

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 120) / 15);

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
      {/* Left: "Your deal" text */}
      <div style={{ flex: 1, padding: "0 60px" }}>
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
          Your car.
          <br />
          Your price.
          <br />
          <span style={{ color: COLOR.brand }}>Your deal.</span>
        </div>
      </div>

      {/* Right: ChatScreen in phone */}
      <div
        style={{
          opacity: phoneSpring,
          transform: `translate3d(${(1 - phoneSpring) * 40}px, 0, 0) rotate(${(1 - phoneSpring) * 5}deg)`,
          filter: `blur(${(1 - phoneSpring) * 8}px)`,
        }}
      >
        <PhoneFrame width={240} height={480} tilt={-3}>
          <ChatScreen frame={Math.max(0, frame - 15)} />
        </PhoneFrame>
      </div>
    </div>
  );
}
