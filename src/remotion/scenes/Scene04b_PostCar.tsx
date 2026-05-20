import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, EASE, RADIUS, SHADOW } from "../design";
import { PhoneFrame } from "../components/PhoneFrame";
import { Cursor } from "../components/Cursor";

export function Scene04b_PostCar() {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [130, 145], [1, 0], { extrapolateRight: "clamp" });

  // Phone animation - FASTER
  const phoneOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const phoneX = interpolate(frame, [0, 12], [60, 0], { extrapolateRight: "clamp", easing: EASE });

  // Form fields appearing - FASTER stagger
  const fields = [
    { label: "Toyota Hilux 2021", icon: "Car", delay: 15 },
    { label: "TSh 78,500,000", icon: "Price", delay: 22 },
    { label: "Dar es Salaam", icon: "Loc", delay: 29 },
    { label: "45,000 km", icon: "Km", delay: 36 },
  ];

  // Submit button
  const btnOp = interpolate(frame, [50, 62], [0, 1], { extrapolateRight: "clamp", easing: EASE });
  const btnScale = interpolate(frame, [55, 65], [0.9, 1], { extrapolateRight: "clamp", easing: EASE });

  // Success checkmark
  const successOp = interpolate(frame, [75, 88], [0, 1], { extrapolateRight: "clamp", easing: EASE });

  const phoneLeft = (1280 - 320) / 2;
  const phoneTop = (720 - 680) / 2;

  // Cursor path: natural movement through form fields
  const cursorPath = [
    { frame: 0,  x: phoneLeft + 260, y: phoneTop + 500 },  // starts below phone
    { frame: 15, x: phoneLeft + 200, y: phoneTop + 350 },  // entering
    { frame: 30, x: phoneLeft + 160, y: phoneTop + 250 },  // photo area
    { frame: 45, x: phoneLeft + 160, y: phoneTop + 320 },  // first field
    { frame: 55, x: phoneLeft + 160, y: phoneTop + 370 },  // second field
    { frame: 65, x: phoneLeft + 160, y: phoneTop + 420 },  // submit button hover
    { frame: 75, x: phoneLeft + 160, y: phoneTop + 420 },  // click
    { frame: 95, x: phoneLeft + 260, y: phoneTop + 500 },  // exit
  ];

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: COLOR.bg,
      display: "flex", alignItems: "center",
      padding: "0 80px",
      opacity: fadeOut,
    }}>
      {/* Left text */}
      <div style={{ flex: 1, paddingRight: 50, maxWidth: 480 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: COLOR.brand,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.12em", textTransform: "uppercase",
          marginBottom: 16,
          opacity: interpolate(frame, [5, 15], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          For Sellers
        </div>

        <div style={{
          fontSize: 42, fontWeight: 800,
          color: COLOR.ink,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: 16,
          opacity: interpolate(frame, [8, 18], [0, 1], { extrapolateRight: "clamp", easing: EASE }),
          transform: `translateY(${interpolate(frame, [8, 18], [10, 0], { extrapolateRight: "clamp", easing: EASE })}px)`,
        }}>
          Post your car
          <br />
          <span style={{ color: COLOR.brand }}>in 2 minutes</span>
        </div>

        <div style={{
          fontSize: 15,
          color: COLOR.inkSoft,
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.5,
          opacity: interpolate(frame, [12, 22], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          Add photos, set your price, and reach thousands of buyers across East Africa. Free forever.
        </div>
      </div>

      {/* Phone */}
      <div style={{
        opacity: phoneOp,
        transform: `translateX(${phoneX}px)`,
        flexShrink: 0,
      }}>
        <PhoneFrame width={320} height={680} tilt={4}>
          <div style={{ height: "100%", background: COLOR.surface, display: "flex", flexDirection: "column", padding: "16px" }}>
            <div style={{
              fontSize: 18, fontWeight: 800, color: COLOR.ink,
              fontFamily: "Inter", marginBottom: 16,
            }}>
              Sell Your Car
            </div>

            {/* Photo upload area */}
            <div style={{
              height: 120,
              background: COLOR.brandSoft,
              borderRadius: RADIUS.lg,
              border: `2px dashed ${COLOR.brand}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
              opacity: interpolate(frame, [10, 18], [0, 1], { extrapolateRight: "clamp" }),
            }}>
                <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLOR.brand, fontWeight: 600, fontFamily: "Inter" }}>Add Photos</div>
              </div>
            </div>

            {/* Form fields */}
            {fields.map((field, i) => {
              const op = interpolate(frame, [field.delay, field.delay + 10], [0, 1], { extrapolateRight: "clamp" });
              const y = interpolate(frame, [field.delay, field.delay + 10], [8, 0], { extrapolateRight: "clamp" });
              return (
                <div key={i} style={{
                  background: COLOR.bg,
                  borderRadius: RADIUS.md,
                  border: `1px solid ${COLOR.border}`,
                  padding: "10px 12px",
                  marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 8,
                  opacity: op,
                  transform: `translateY(${y}px)`,
                }}>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: COLOR.brand,
                    background: COLOR.brandSoft,
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontFamily: "Inter",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>{field.icon}</span>
                  <span style={{ fontSize: 12, color: COLOR.ink, fontFamily: "Inter", fontWeight: 500 }}>{field.label}</span>
                </div>
              );
            })}

            {/* Submit button */}
            <div style={{
              opacity: btnOp,
              transform: `scale(${btnScale})`,
              marginTop: 8,
            }}>
              <div style={{
                background: COLOR.brand,
                color: "white",
                borderRadius: RADIUS.lg,
                padding: "14px",
                textAlign: "center",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "Inter",
                boxShadow: SHADOW.brand,
              }}>
                Post Listing →
              </div>
            </div>

            {/* Success */}
            <div style={{
              opacity: successOp,
              marginTop: 12,
              textAlign: "center",
            }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#DCFCE7",
                color: "#166534",
                padding: "8px 16px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "Inter",
              }}>
                ✓ Posted! Live in 30 seconds
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>

      <Cursor path={cursorPath} clickFrame={70} startFrame={0} hideFrame={100} />
    </div>
  );
}
