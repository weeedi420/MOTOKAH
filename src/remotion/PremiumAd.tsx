import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing, staticFile, spring } from "remotion";
import React from "react";

// Script timing (synced to a hypothetical voiceover):
// 0-3s: "Buying a car in East Africa..."
// 3-6s: "Used to mean scams, overpriced deals, and zero trust."
// 6-9s: "Motokah changes everything."
// 9-12s: "Search thousands of verified listings..."
// 12-15s: "From Dar es Salaam to Nairobi, Uganda to Rwanda."
// 15-18s: "Chat directly with verified sellers."
// 18-21s: "Over 150,000 vehicles. 2.5 million buyers."
// 21-24s: "Your perfect ride is waiting."

export const MotokahPremiumAd = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;

  // Easing curves
  const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
  const quintOut = Easing.bezier(0.23, 1, 0.32, 1);
  
  // Total: 24 seconds @ 30fps = 720 frames
  const totalDuration = 720;

  // === SCENE TIMING ===
  const scenes = {
    s1_hook: { start: 0, end: 90 },      // 0-3s: The Problem
    s2_pain: { start: 60, end: 180 },    // 2-6s: The Pain Points  
    s3_brand: { start: 150, end: 270 },  // 5-9s: Motokah Intro
    s4_search: { start: 240, end: 360 }, // 8-12s: Search
    s5_locations: { start: 330, end: 450 }, // 11-15s: Multi-country
    s6_features: { start: 420, end: 540 },  // 14-18s: Features
    s7_stats: { start: 510, end: 630 },     // 17-21s: Stats
    s8_cta: { start: 600, end: 720 },       // 20-24s: CTA
  };

  // Helper to get scene progress
  const sceneProgress = (scene: typeof scenes.s1_hook) => {
    return interpolate(frame, [scene.start, scene.end - 30], [0, 1], { 
      easing: expoOut, 
      extrapolateLeft: "clamp", 
      extrapolateRight: "clamp" 
    });
  };

  const sceneFadeOut = (scene: typeof scenes.s1_hook) => {
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

  // === CAMERA DRIFT (always present) ===
  const driftX = Math.sin(frame * 0.015) * 5;
  const driftY = Math.cos(frame * 0.012) * 4;

  return (
    <AbsoluteFill style={{ 
      background: "#0f172a", 
      fontFamily: "Inter, system-ui, sans-serif",
      overflow: "hidden",
    }}>

      {/* ==================== SCENE 1: THE HOOK ==================== */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: s1Out,
        background: "linear-gradient(160deg, #0a0e1a 0%, #1a2a4a 50%, #0a0e1a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `translate(${driftX}px, ${driftY}px) scale(${interpolate(s1, [0, 1], [1.1, 1])})`,
      }}>
        {/* Animated ambient orbs */}
        <div style={{
          position: "absolute",
          width: 700,
          height: 700,
          background: "radial-gradient(circle, rgba(0,102,204,0.2) 0%, transparent 60%)",
          borderRadius: "50%",
          top: "20%",
          left: "10%",
          transform: `translate(${Math.sin(frame * 0.025) * 40}px, ${Math.cos(frame * 0.02) * 30}px)`,
          filter: "blur(80px)",
        }} />

        <div style={{
          textAlign: "center",
          zIndex: 10,
          maxWidth: 700,
          padding: "0 40px",
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "rgba(148, 163, 184, 0.5)",
            marginBottom: 40,
            opacity: interpolate(s1, [0, 0.5], [0, 1]),
            transform: `translateY(${interpolate(s1, [0, 0.5], [20, 0])}px)`,
          }}>
            Buying a car in East Africa
          </div>

          <h1 style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "white",
            margin: 0,
            textShadow: "0 0 60px rgba(0,102,204,0.4)",
            opacity: interpolate(s1, [0.1, 0.8], [0, 1]),
            transform: `translateY(${interpolate(s1, [0.1, 0.8], [50, 0])}px)`,
          }}>
            Used to be a
            <br />
            <span style={{ color: "#E8453A", fontStyle: "italic" }}>nightmare</span>
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
          transform: `translate(${driftX * 0.5}px, ${driftY * 0.5}px)`,
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "rgba(148, 163, 184, 0.5)",
            marginBottom: 48,
            opacity: interpolate(s2, [0, 0.5], [0, 1]),
          }}>
            Scams. Overpriced. No trust.
          </div>

          <div style={{
            display: "flex",
            gap: 24,
            opacity: interpolate(s2, [0.2, 0.8], [0, 1]),
          }}>
            {[
              { icon: "⚠️", title: "Fake Listings", desc: "Waste time & money" },
              { icon: "💸", title: "Hidden Fees", desc: "Prices skyrocket" },
              { icon: "😤", title: "No Support", desc: "Left in the dark" },
            ].map((item, i) => (
              <div key={item.title} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "32px 28px",
                width: 200,
                textAlign: "center",
                opacity: interpolate(s2, [0.3 + i * 0.1, 0.8], [0, 1]),
                transform: `translateY(${interpolate(s2, [0.3 + i * 0.1, 0.8], [40, 0])}px)`,
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>{item.desc}</div>
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
          background: "linear-gradient(135deg, #F8FAFC 0%, #e0f2fe 50%, #F8FAFC 100%)",
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
              color: "white",
              fontSize: 36,
              fontWeight: 900,
              boxShadow: "0 20px 50px -15px rgba(0, 102, 204, 0.4)",
            }}>M</div>
            <span style={{ fontSize: 48, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>motokah</span>
          </div>

          <h2 style={{
            fontSize: 48,
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
            color: "#64748b",
            opacity: interpolate(s3, [0.4, 1], [0, 1]),
          }}>
            Africa's trusted vehicle marketplace
          </div>
        </div>
      )}

      {/* ==================== SCENE 4: PHONE WITH CAR ==================== */}
      {s4 > 0 && (
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: s4Out,
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "rgba(148, 163, 184, 0.5)",
            position: "absolute",
            top: 60,
            opacity: interpolate(s4, [0, 0.5], [0, 1]),
          }}>
            Search thousands of verified listings
          </div>

          {/* Phone Frame */}
          <div style={{
            width: 340,
            height: 680,
            background: "#1e293b",
            borderRadius: 48,
            padding: 12,
            boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.1) inset",
            transform: `rotateY(${interpolate(s4, [0, 1], [20, 0])}deg) rotateX(${interpolate(s4, [0, 1], [-10, 0])}deg) scale(${interpolate(s4, [0, 1], [0.85, 1])})`,
            transformStyle: "preserve-3d",
            perspective: 1000,
          }}>
            {/* Phone Screen */}
            <div style={{
              width: "100%",
              height: "100%",
              background: "#0f172a",
              borderRadius: 40,
              overflow: "hidden",
              position: "relative",
            }}>
              {/* App Header */}
              <div style={{
                background: "#1e293b",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  background: "#0066CC",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 900,
                }}>M</div>
                <span style={{ fontSize: 16, fontWeight: 800, color: "white" }}>motokah</span>
              </div>

              {/* Search Bar */}
              <div style={{
                margin: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span style={{ fontSize: 13, color: "#64748b" }}>Toyota Fortuner...</span>
              </div>

              {/* Car Card */}
              <div style={{
                margin: "0 16px",
                background: "#1e293b",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                {/* Car Image */}
                <div style={{
                  height: 180,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <img
                    src={staticFile("cars/fortuner-white-2019-1.jpg")}
                    alt="Toyota Fortuner"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: `scale(${interpolate(s4, [0, 1], [1.1, 1])})`,
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "#0066CC",
                    color: "white",
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "4px 10px",
                    borderRadius: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>Featured</div>
                </div>

                {/* Car Info */}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 4 }}>2019 Toyota Fortuner</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Dar es Salaam, Tanzania</div>
                  
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    {["45K km", "Diesel", "Auto"].map((spec) => (
                      <div key={spec} style={{
                        background: "rgba(255,255,255,0.05)",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}>
                        {spec}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#0066CC" }}>TSh 75M</div>
                    <div style={{
                      background: "rgba(39, 166, 89, 0.15)",
                      color: "#4ade80",
                      fontSize: 10,
                      fontWeight: 900,
                      padding: "4px 10px",
                      borderRadius: 6,
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
            fontSize: 15,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "#94a3b8",
            marginBottom: 48,
            opacity: interpolate(s5, [0, 0.5], [0, 1]),
          }}>
            From Dar es Salaam to Nairobi
          </div>

          <div style={{
            display: "flex",
            gap: 20,
            opacity: interpolate(s5, [0.2, 0.8], [0, 1]),
          }}>
            {[
              { name: "Tanzania", flag: "🇹🇿", listings: "45K+" },
              { name: "Kenya", flag: "🇰🇪", listings: "38K+" },
              { name: "Uganda", flag: "🇺🇬", listings: "22K+" },
              { name: "Rwanda", flag: "🇷🇼", listings: "15K+" },
              { name: "Ethiopia", flag: "🇪🇹", listings: "18K+" },
            ].map((country, i) => (
              <div key={country.name} style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: "28px 24px",
                textAlign: "center",
                width: 140,
                boxShadow: "0 20px 50px -15px rgba(0, 0, 0, 0.08)",
                opacity: interpolate(s5, [0.3 + i * 0.08, 0.8], [0, 1]),
                transform: `translateY(${interpolate(s5, [0.3 + i * 0.08, 0.8], [30, 0])}px)`,
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{country.flag}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{country.name}</div>
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
            fontSize: 15,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "rgba(148, 163, 184, 0.5)",
            marginBottom: 48,
            opacity: interpolate(s6, [0, 0.5], [0, 1]),
          }}>
            Everything you need
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            maxWidth: 700,
            opacity: interpolate(s6, [0.2, 0.8], [0, 1]),
         