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

  const fadeOut = Math.max(0, 1 - Math.max(0, frame - 1450) / 12);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 50,
        padding: "0 60px",
        opacity: fadeOut,
      }}
    >
      <div style={{ flex: 1, padding: "0 40px" }}>
        <div
          style={{
            fontSize: 38,
            fontWeight: 800,
            color: COLOR.ink,
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 20,
            opacity: textSpring,
            transform: `translate3d(0, ${(1 - textSpring) * 20}px, 0)`,
          }}
        >
          Your car.
          <br />
          Your price.
          <br />
          <span style={{ color: COLOR.brand }}>Your deal.</span>
        </div>
      </div>

      <div
        style={{
          opacity: phoneSpring,
          transform: `translate3d(${(1 - phoneSpring) * 30}px, 0, 0)`,
        }}
      >
        <PhoneFrame width={260} height={520} tilt={-3}>
          <ChatScreen frame={Math.max(0, frame - 15)} />
        </PhoneFrame>
      </div>
    </div>
  );
}
