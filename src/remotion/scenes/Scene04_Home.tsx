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
        gap: 50,
        padding: "0 60px",
        opacity: fadeOut,
      }}
    >
      <div style={{ flex: 1, maxWidth: 500, paddingRight: 20 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: COLOR.brand,
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 16,
            opacity: titleSpring,
            transform: `translate3d(0, ${(1 - titleSpring) * 15}px, 0)`,
          }}
        >
          For Sellers
        </div>

        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: COLOR.ink,
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 20,
            opacity: titleSpring,
            transform: `translate3d(0, ${(1 - titleSpring) * 20}px, 0)`,
          }}
        >
          Post your car
          <br />
          in <span style={{ color: COLOR.brand }}>2 minutes</span>.
        </div>

        <div
          style={{
            fontSize: 16,
            color: COLOR.ok,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: titleSpring,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill={COLOR.ok}/>
            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Completely free. Forever.
        </div>
      </div>

      <div
        style={{
          opacity: phoneSpring,
          transform: `translate3d(${(1 - phoneSpring) * 30}px, 0, 0)`,
        }}
      >
        <PhoneFrame width={260} height={520} tilt={-3}>
          <HomeScreen frame={Math.max(0, frame - 8)} showTyping={true} />
        </PhoneFrame>
      </div>
    </div>
  );
}
