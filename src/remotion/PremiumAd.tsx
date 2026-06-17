import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing, staticFile, Audio } from "remotion";
import React from "react";

// SVG Icons - lightweight
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8453A" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27A659" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const IconMessage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#E8913A" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27A659" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconPhone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
    <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const IconTrending = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2.5">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconMapPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8453A" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconCar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
    <circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" />
  </svg>
);

export const MotokahPremiumAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
  
  // 24 seconds = 720 frames
  const scenes = {
    s1_hook: { start: 0, end: 90 },
    s2_pain: { start: 60, end: 180 },
    s3_brand: { start: 150, end: 270 },
    s4_search: { start: 240, end: 360 },
    s5_locations: { start: 330, end: 450 },
    s6_features: { start: 420, end: 540 },
    s7_stats: { start: 510, end: 630 },
    s8_cta: { start: 600, end: 720 },
  };

  const sceneProgress = (scene) => {
    return interpolate(frame, [scene.start, scene.end - 30], [0, 1], { 
      easing: expoOut, 
      extrapolateLeft: "clamp", 
      extrapolateRight: "clamp" 
    });
  };

  const sceneFadeOut = (scene) => {
    return interpolate(frame, [scene.end - 30, scene.end], [1, 0], { 
      extrapolateLeft: "clamp", 
      extrapolateRight: "clamp" 
    });
  };

  const s1 = sceneProgress(scenes.s1_hook);
  const s1Out = sceneFadeOut(scenes.s1_hook);
  const s2 = sceneProgress(scenes.s2_pain);
  const s2Out = sceneFadeOut(scenes.s2_pain);
  const s3 = sceneProgress(scenes.s3_brand);
  const s3Out = sceneFadeOut(scenes.s3_brand);
  const s4 = sceneProgress(scenes.s4_search);
  const s4Out = sceneFadeOut(scenes.s4_search);
  const s5 = sceneProgress(scenes.s5_locations);
  const s5Out = sceneFadeOut(scenes.s5_locations);
  const s6 = sceneProgress(scenes.s6_features);
  const s6Out = sceneFadeOut(scenes.s6_features);
  const s7 = sceneProgress(scenes.s7_stats);
  const s7Out = sceneFadeOut(scenes.s7_stats);
  const s8 = sceneProgress(scenes.s8_cta);

  return (
    <AbsoluteFill style={{ background: "#0f172a", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      
      <Audio src={staticFile("voiceover.mp3")} startFrom={0} endAt={720} volume={1} />

      {/* ==================== SCENE 1: THE HOOK ==================== */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: s1Out,
        background: "linear-gradient(160deg, #0a0e1a 0%, #1a2a4a 50%, #0a0e1a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center", zIndex: 10, maxWidth: 700, padding: "0 40px" }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "#64748b",
            marginBottom: 40,
            opacity: interpolate(s1, [0, 0.5], [0, 1]),
            transform: `translateY(${interpolate(s1, [0, 0.5], [20, 0])}px)`,
          }}>
            Every day in East Africa
          </div>

          <h1 style={{
            fontSize: 76,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "#ffffff",
            margin: 0,
            opacity: interpolate(s1, [0.1, 0.8], [0, 1]),
            transform: `translateY(${interpolate(s1, [0.1, 0.8], [60, 0])}px)`,
          }}>
            Finding a car
            <br />
            is a <span style={{ color: "#E8453A" }}>nightmare</span>
          </h1>
        </div>
      </div>

      {/* ==================== SCENE 2: THE PAIN ==================== */}
      {s2 > 0 && (
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: s2Out,
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "#64748b",
            marginBottom: 48,
            opacity: interpolate(s2, [0, 0.5], [0, 1]),
          }}>
            Scams. Overpriced. No trust.
          </div>

          <div style={{ display: "flex", gap: 24, opacity: interpolate(s2, [0.2, 0.8], [0, 1]) }}>
            {[
              { icon: <IconX />, title: "Fake Listings", desc: "Waste time \u0026 money" },
              { icon: <IconX />, title: "Hidden Fees", desc: "Prices skyrocket" },
              { icon: <IconX />, title: "No Support", desc: "Left in the dark" },
            ].map((item, i) => (
              <div key={item.title} style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 20,
                padding: "36px 28px",
                width: 220,
                textAlign: "center",
                opacity: interpolate(s2, [0.3 + i * 0.1, 0.8], [0, 1]),
                transform: `translateY(${interpolate(s2, [0.3 + i * 0.1, 0.8], [40, 0])}px)`,
              }}>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>{item.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== SCENE 3: BRAND REVEAL ==================== */}
      {s3 > 0 && (
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: s3Out,
          background: "#F8FAFC",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
            opacity: interpolate(s3, [0, 0.6], [0, 1]),
            transform: `scale(${interpolate(s3, [0, 0.6], [0.8, 1])})`,
          }}>
            <div style={{
              width: 72,
              height: 72,
              background: "#0066CC",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 36,
              fontWeight: 900,
            }}>M</div>
            <span style={{ fontSize: 48, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>motokah</span>
          </div>

          <h2 style={{
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#0f172a",
            textAlign: "center",
            margin: 0,
            opacity: interpolate(s3, [0.2, 0.8], [0, 1]),
            transform: `translateY(${interpolate(s3, [0.2, 0.8], [30, 0])}px)`,
          }}>
            Changes
            <br />
            <span style={{ color: "#0066CC" }}>Everything</span>
          </h2>

          <div style={{
            marginTop: 32,
            fontSize: 18,
            fontWeight: 500,
            color: "#475569",
            opacity: interpolate(s3, [0.4, 1], [0, 1]),
          }}>
            Africa's trusted vehicle marketplace
          </div>
        </div>
      )}

      {/* ==================== SCENE 4: PHONE APP ==================== */}
      {s4 > 0 && (
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: s4Out,
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "#64748b",
            marginBottom: 40,
            opacity: interpolate(s4, [0, 0.5], [0, 1]),
          }}>
            Search thousands of verified listings
          </div>

          {/* Phone Frame - Simplified */}
          <div style={{
            width: 300,
            height: 600,
            background: "#1e293b",
            borderRadius: 36,
            padding: 10,
            boxShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.8)",
            transform: `rotateY(${interpolate(s4, [0, 1], [20, 0])}deg) scale(${interpolate(s4, [0, 1], [0.9, 1])})`,
          }}>
            <div style={{
              width: "100%",
              height: "100%",
              background: "#0f172a",
              borderRadius: 28,
              overflow: "hidden",
            }}>
              {/* App Header */}
              <div style={{
                background: "#1e293b",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom: "1px solid #334155",
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  background: "#0066CC",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 900,
                }}>M</div>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#ffffff" }}>motokah</span>
              </div>

              {/* Search Bar */}
              <div style={{
                margin: "10px 14px",
                background: "#1e293b",
                borderRadius: 10,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #334155",
              }}>
                <IconSearch />
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Toyota Fortuner...</span>
              </div>

              {/* Car Card */}
              <div style={{
                margin: "0 14px",
                background: "#1e293b",
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid #334155",
              }}>
                <div style={{ height: 160, position: "relative", overflow: "hidden" }}>
                  <img
                    src={staticFile("cars/fortuner-white-2019-1.jpg")}
                    alt="Toyota Fortuner"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "#0066CC",
                    color: "#ffffff",
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "3px 8px",
                    borderRadius: 5,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>Featured</div>
                </div>

                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", marginBottom: 3 }}>2019 Toyota Fortuner</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>Dar es Salaam, Tanzania</div>
                  
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    {["45K km", "Diesel", "Auto"].map((spec) => (
                      <div key={spec} style={{
                        background: "#334155",
                        padding: "3px 8px",
                        borderRadius: 5,
                        fontSize: 10,
                        color: "#e2e8f0",
                        fontWeight: 600,
                      }}>{spec}</div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#0066CC" }}>TSh 75M</div>
                    <div style={{
                      background: "rgba(39, 166, 89, 0.2)",
                      color: "#4ade80",
                      fontSize: 10,
                      fontWeight: 900,
                      padding: "3px 8px",
                      borderRadius: 5,
                    }}>Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCENE 5: LOCATIONS ==================== */}
      {s5 > 0 && (
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: s5Out,
          background: "#F8FAFC",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "#475569",
            marginBottom: 48,
            opacity: interpolate(s5, [0, 0.5], [0, 1]),
          }}>
            Across East Africa
          </div>

          <div style={{ display: "flex", gap: 16, opacity: interpolate(s5, [0.2, 0.8], [0, 1]) }}>
            {[
              { name: "Tanzania", listings: "45K+" },
              { name: "Kenya", listings: "38K+" },
              { name: "Uganda", listings: "22K+" },
              { name: "Rwanda", listings: "15K+" },
              { name: "Ethiopia", listings: "18K+" },
            ].map((country, i) => (
              <div key={country.name} style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: "24px 20px",
                textAlign: "center",
                width: 130,
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
                opacity: interpolate(s5, [0.3 + i * 0.08, 0.8], [0, 1]),
                transform: `translateY(${interpolate(s5, [0.3 + i * 0.08, 0.8], [25, 0])}px)`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{country.name}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0066CC" }}>{country.listings}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== SCENE 6: FEATURES ==================== */}
      {s6 > 0 && (
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: s6Out,
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "#64748b",
            marginBottom: 48,
            opacity: interpolate(s6, [0, 0.5], [0, 1]),
          }}>
            Everything you need
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            maxWidth: 640,
            opacity: interpolate(s6, [0.2, 0.8], [0, 1]),
          }}>
            {[
              { icon: <IconCheck />, title: "Verified Sellers", desc: "ID-checked dealers" },
              { icon: <IconMessage />, title: "Direct Chat", desc: "Talk to sellers instantly" },
              { icon: <IconSearch />, title: "Smart Search", desc: "Filter by price, make, location" },
              { icon: <IconStar />, title: "Reviews", desc: "Ratings from real buyers" },
              { icon: <IconShield />, title: "Secure Deals", desc: "Safe transactions guaranteed" },
              { icon: <IconPhone />, title: "Mobile App", desc: "Buy \u0026 sell on the go" },
            ].map((feature, i) => (
              <div key={feature.title} style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 16,
                padding: "24px 20px",
                textAlign: "center",
                opacity: interpolate(s6, [0.3 + i * 0.06, 0.8], [0, 1]),
                transform: `translateY(${interpolate(s6, [0.3 + i * 0.06, 0.8], [20, 0])}px)`,
              }}>
                <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>{feature.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#ffffff", marginBottom: 6 }}>{feature.title}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== SCENE 7: STATS ==================== */}
      {s7 > 0 && (
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: s7Out,
          background: "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{ display: "flex", gap: 48 }}>
            {[
              { value: "150K+", label: "Vehicle Listings", icon: <IconCar /> },
              { value: "2.5M", label: "Active Buyers", icon: <IconUsers /> },
              { value: "50+", label: "Cities Covered", icon: <IconMapPin /> },
              { value: "100K+", label: "Safe Deals", icon: <IconTrending /> },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                textAlign: "center",
                opacity: interpolate(s7, [i * 0.08, 0.3 + i * 0.08], [0, 1]),
                transform: `translateY(${interpolate(s7, [i * 0.08, 0.3 + i * 0.08], [30, 0])}px)`,
              }}>
                <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>{stat.icon}</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>{stat.value}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 8 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== SCENE 8: CTA ==================== */}
      {s8 > 0 && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, #0a0e1a 0%, #1a2a4a 50%, #0a0e1a 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            textAlign: "center",
            opacity: interpolate(s8, [0, 0.5], [0, 1]),
            transform: `translateY(${interpolate(s8, [0, 0.5], [40, 0])}px)`,
          }}>
            <div style={{
              fontSize: 52,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "#ffffff",
              marginBottom: 20,
            }}>
              Your perfect ride
              <br />
              is waiting
            </div>

            <div style={{
              fontSize: 18,
              fontWeight: 500,
              color: "#94a3b8",
              marginBottom: 40,
              opacity: interpolate(s8, [0.2, 0.7], [0, 1]),
            }}>
              Join 2.5 million buyers across Africa
            </div>

            <div style={{
              background: "#0066CC",
              color: "#ffffff",
              padding: "18px 48px",
              borderRadius: 14,
              fontSize: 18,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 20px 50px -15px rgba(0, 102, 204, 0.5)",
              opacity: interpolate(s8, [0.3, 0.8], [0, 1]),
              transform: `scale(${interpolate(s8, [0.3, 0.8], [0.9, 1])})`,
            }}>
              Start Your Search
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            <div style={{
              marginTop: 32,
              fontSize: 14,
              color: "#64748b",
              fontWeight: 500,
              opacity: interpolate(s8, [0.5, 1], [0, 1]),
            }}>
              motokah.com • Free forever
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
