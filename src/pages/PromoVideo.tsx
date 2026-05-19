import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from "framer-motion";

// ── Car SVG (side profile) ────────────────────────────────────────────────────
function CarSVG({ color = "#0099FF", scale = 1 }: { color?: string; scale?: number }) {
  return (
    <svg width={120 * scale} height={50 * scale} viewBox="0 0 120 50" fill="none">
      <rect x="5" y="22" width="110" height="22" rx="7" fill={color} />
      <path d="M 34 22 L 43 7 L 80 7 L 87 22 Z" fill={color} opacity="0.85" />
      <path d="M 37 22 L 44 11 L 60 11 L 60 22 Z" fill="rgba(180,230,255,0.55)" />
      <path d="M 62 11 L 78 11 L 83 22 L 62 22 Z" fill="rgba(180,230,255,0.42)" />
      <circle cx="90" cy="44" r="9" fill="#111" stroke="#aaa" strokeWidth="2" />
      <circle cx="90" cy="44" r="4" fill="#444" />
      <circle cx="28" cy="44" r="9" fill="#111" stroke="#aaa" strokeWidth="2" />
      <circle cx="28" cy="44" r="4" fill="#444" />
      <rect x="110" y="27" width="5" height="6" rx="2" fill="#ffe066" />
      <rect x="5" y="27" width="5" height="6" rx="2" fill="#ff4040" opacity="0.9" />
      <rect x="47" y="8" width="1.5" height="14" rx="1" fill="rgba(180,230,255,0.3)" />
    </svg>
  );
}

// ── Scrolling road ────────────────────────────────────────────────────────────
function Road() {
  return (
    <div className="absolute pointer-events-none" style={{ bottom: 80, left: 0, right: 0, height: 4, overflow: "hidden" }}>
      <motion.div
        style={{ display: "flex", gap: 24, width: "200%" }}
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{ width: 48, height: 4, background: "#ffffff22", borderRadius: 2, flexShrink: 0 }} />
        ))}
      </motion.div>
    </div>
  );
}

// ── Speed lines ───────────────────────────────────────────────────────────────
function SpeedLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          style={{ position: "absolute", top: `${18 + i * 9}%`, left: 0, height: 2, background: "linear-gradient(90deg, transparent, #0099FF55)", borderRadius: 1 }}
          animate={{ width: ["0%", "45%"], x: ["5%", "-5%"], opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.06, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ── Smoke puff ────────────────────────────────────────────────────────────────
function SmokePuff({ x, y, id }: { x: number; y: number; id: number }) {
  const dx = ((id * 13) % 30) - 15;
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{ left: `calc(50% + ${x - 10}px)`, top: `calc(50% + ${y - 10}px)`, width: 20, height: 20, background: "rgba(210,210,220,0.35)", filter: "blur(5px)" }}
      initial={{ scale: 0.3, opacity: 0.7 }}
      animate={{ scale: 3.5, opacity: 0, x: dx, y: -35 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
    />
  );
}

// ── Phone mockup ──────────────────────────────────────────────────────────────
function PhoneMockup() {
  const [typed, setTyped] = useState("");
  const target = "Toyota Hilux TZ...";
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => { if (i < target.length) setTyped(target.slice(0, ++i)); else clearInterval(id); }, 80);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ width: 220, height: 400, borderRadius: 28, background: "#0d1117", border: "2px solid #2a2a3a", overflow: "hidden", padding: "14px 14px 12px", boxShadow: "0 24px 64px rgba(0,0,0,0.85), 0 0 0 1px #ffffff08" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 9, color: "#555" }}>
        <span>9:41</span><span style={{ letterSpacing: 1 }}>●●●●</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#161b27", borderRadius: 10, padding: "7px 10px", marginBottom: 10, fontSize: 10, color: "#888" }}>
        <span style={{ opacity: 0.6 }}>🔍</span>
        <span style={{ color: "#ccc" }}>{typed}</span>
        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ color: "#0099FF" }}>|</motion.span>
      </div>
      {[
        { title: "2019 Toyota Hilux", price: "TZS 95M", loc: "Dar es Salaam", bg: "#0d1e2e" },
        { title: "2020 Land Rover Discovery", price: "TZS 85M", loc: "Arusha", bg: "#0d1e1a" },
      ].map((car, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.45 }}
          style={{ background: car.bg, borderRadius: 12, padding: 10, marginBottom: 8, border: "1px solid #ffffff0a" }}>
          <div style={{ background: "#0099FF18", height: 52, borderRadius: 8, marginBottom: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CarSVG scale={0.55} color={i === 0 ? "#0099FF" : "#00cc88"} />
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#eee", marginBottom: 2 }}>{car.title}</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "#0099FF", fontWeight: 600 }}>{car.price}</span>
            <span style={{ fontSize: 9, color: "#666" }}>{car.loc}</span>
          </div>
        </motion.div>
      ))}
      <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
        style={{ background: "#25D366", borderRadius: 10, padding: "9px 10px", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#fff", marginTop: 2 }}>
        📱 WhatsApp Seller
      </motion.div>
    </div>
  );
}

// ── Main PromoVideo ───────────────────────────────────────────────────────────
export default function PromoVideo() {
  const [loopKey, setLoopKey] = useState(0);
  const [scene, setScene] = useState(0);
  const [smokes, setSmokes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [circleVisible, setCircleVisible] = useState(false);
  const smokeIdRef = useRef(0);

  // Drift motion value — angle around the circle
  const driftAngle = useMotionValue(-Math.PI / 2); // start at top
  const RADIUS = 88;
  const CIRC = 2 * Math.PI * RADIUS;

  const carDriftX = useTransform(driftAngle, (a) => Math.cos(a) * RADIUS);
  const carDriftY = useTransform(driftAngle, (a) => Math.sin(a) * RADIUS);
  // Car points tangentially: rotate = angle + 90°
  const carDriftRotate = useTransform(driftAngle, (a) => (a * 180) / Math.PI + 90);
  // SVG circle stroke draws as angle progresses: -π/2 → 3π/2 maps to dash 0→CIRC drawn
  const strokeDashoffset = useTransform(driftAngle, [-Math.PI / 2, (3 * Math.PI) / 2], [CIRC, 0]);

  // Scene timing (cumulative ms from scene 0 start)
  useEffect(() => {
    const TIMES = [3000, 7000, 10000, 13000, 18000, 20500];
    const ids = TIMES.map((t, i) => setTimeout(() => setScene(i + 1), t));
    // Loop reset
    const resetId = setTimeout(() => {
      setScene(0);
      driftAngle.set(-Math.PI / 2);
      setCircleVisible(false);
      setSmokes([]);
      setLoopKey((k) => k + 1);
    }, 21000);
    return () => { ids.forEach(clearTimeout); clearTimeout(resetId); };
  }, [loopKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drift animation — runs when scene 1 starts
  useEffect(() => {
    if (scene !== 1) return;
    setCircleVisible(true);

    const ctrl = animate(driftAngle, (3 * Math.PI) / 2, { duration: 3.4, ease: "linear" });

    const smokeId = setInterval(() => {
      const a = driftAngle.get();
      const x = Math.cos(a) * RADIUS;
      const y = Math.sin(a) * RADIUS;
      setSmokes((s) => [...s.slice(-10), { id: smokeIdRef.current++, x, y }]);
    }, 180);

    return () => { ctrl.stop(); clearInterval(smokeId); };
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0F1419", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* 16:9 canvas */}
      <div style={{ width: "min(100vw, 177.78vh)", height: "min(100vh, 56.25vw)", position: "relative", overflow: "hidden", background: "#0F1419" }}>

        {/* ── Scene 0: Car drives in ─────────────────────────────────────────── */}
        <AnimatePresence>
          {scene === 0 && (
            <motion.div key="s0" className="absolute inset-0" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Road />
              <SpeedLines />
              <motion.div
                style={{ position: "absolute", bottom: "14%" }}
                initial={{ x: "-15%" }}
                animate={{ x: "32%" }}
                transition={{ duration: 2.8, ease: [0.2, 0, 0.55, 1] }}
              >
                <CarSVG />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scene 1: Drift — car traces the O ─────────────────────────────── */}
        <AnimatePresence>
          {scene === 1 && (
            <motion.div key="s1" className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

              {/* SVG circle that draws itself as the car drifts */}
              {circleVisible && (
                <svg className="absolute" width={RADIUS * 2 + 40} height={RADIUS * 2 + 40}
                  viewBox={`${-RADIUS - 20} ${-RADIUS - 20} ${RADIUS * 2 + 40} ${RADIUS * 2 + 40}`}
                  style={{ overflow: "visible" }}>
                  <motion.circle cx={0} cy={0} r={RADIUS} fill="none" stroke="#0099FF" strokeWidth="10" strokeLinecap="round"
                    style={{
                      strokeDasharray: CIRC,
                      strokeDashoffset: strokeDashoffset,
                      filter: "drop-shadow(0 0 10px #0099FFAA)",
                      transform: `rotate(${-90}deg)`, // Start from the right (3 o'clock position, going clockwise)
                      transformOrigin: "0 0",
                    }}
                  />
                </svg>
              )}

              {/* Smoke puffs */}
              {smokes.map((s) => <SmokePuff key={s.id} id={s.id} x={s.x} y={s.y} />)}

              {/* Drifting car */}
              <motion.div style={{ position: "absolute", x: carDriftX, y: carDriftY, rotate: carDriftRotate, translateX: "-50%", translateY: "-50%" }}>
                <CarSVG color="#00BBFF" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scene 2: MOTOKAH logo assembles ───────────────────────────────── */}
        <AnimatePresence>
          {scene === 2 && (
            <motion.div key="s2" className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>

              {/* Fading O-circle leftover from drift */}
              <motion.div className="absolute" initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} transition={{ duration: 1 }}>
                <svg width={RADIUS * 2 + 40} height={RADIUS * 2 + 40}
                  viewBox={`${-RADIUS - 20} ${-RADIUS - 20} ${RADIUS * 2 + 40} ${RADIUS * 2 + 40}`}
                  style={{ overflow: "visible" }}>
                  <circle cx={0} cy={0} r={RADIUS} fill="none" stroke="#0099FF" strokeWidth="10"
                    style={{ filter: "drop-shadow(0 0 10px #0099FFAA)" }} />
                </svg>
              </motion.div>

              {/* MOT · O · KAH */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <motion.span style={{ fontSize: 80, fontWeight: 900, color: "#0099FF", letterSpacing: -3, lineHeight: 1, textShadow: "0 0 40px #0099FF66" }}
                  initial={{ x: -140, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.55, ease: [0.2, 0, 0.4, 1] }}>
                  MOT
                </motion.span>
                <motion.span style={{ fontSize: 80, fontWeight: 900, color: "#0099FF", letterSpacing: -3, lineHeight: 1, textShadow: "0 0 60px #0099FFCC", position: "relative", zIndex: 2 }}
                  initial={{ scale: 2.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.25, type: "spring", stiffness: 200 }}>
                  O
                </motion.span>
                <motion.span style={{ fontSize: 80, fontWeight: 900, color: "#0099FF", letterSpacing: -3, lineHeight: 1, textShadow: "0 0 40px #0099FF66" }}
                  initial={{ x: 140, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.55, ease: [0.2, 0, 0.4, 1] }}>
                  KAH
                </motion.span>
              </div>

              {/* Gold underline */}
              <motion.div style={{ height: 4, background: "linear-gradient(90deg, #E8A835, #ffcc55)", borderRadius: 2, marginTop: 6, boxShadow: "0 0 16px #E8A83566" }}
                initial={{ width: 0 }} animate={{ width: 380 }} transition={{ duration: 0.55, delay: 0.6, ease: "easeOut" }} />

              {/* Subtext */}
              <motion.p style={{ color: "#777", fontSize: 15, marginTop: 14, letterSpacing: 4, textTransform: "uppercase" }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                Find Your Perfect Ride
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scene 3: Tagline ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {scene === 3 && (
            <motion.div key="s3" className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              <div style={{ position: "absolute", top: 22, left: 28, fontSize: 22, fontWeight: 900, color: "#0099FF", letterSpacing: -0.5 }}>Motokah</div>

              <motion.div style={{ fontSize: 62, fontWeight: 900, color: "#fff", textAlign: "center", lineHeight: 1.1 }}
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                Buy &amp; Sell Cars
              </motion.div>
              <motion.div style={{ fontSize: 28, fontWeight: 600, color: "#aaa", marginTop: 10, textAlign: "center" }}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
                Bikes &amp; Commercial Vehicles
              </motion.div>

              <motion.div style={{ display: "flex", gap: 18, marginTop: 28, fontSize: 30 }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                {["🇹🇿","🇰🇪","🇺🇬","🇷🇼","🇳🇬"].map((flag, i) => (
                  <motion.span key={flag} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1 + i * 0.1, type: "spring", stiffness: 350 }}>
                    {flag}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scene 4: App mockup ────────────────────────────────────────────── */}
        <AnimatePresence>
          {scene === 4 && (
            <motion.div key="s4" className="absolute inset-0 flex items-center justify-center"
              style={{ gap: "5%" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              <motion.div initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.55, ease: "easeOut" }}>
                <PhoneMockup />
              </motion.div>

              <motion.div style={{ maxWidth: 280 }} initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: 14 }}>
                  East Africa's<br />Car Marketplace
                </div>
                <div style={{ fontSize: 14, color: "#666", lineHeight: 1.8 }}>
                  Browse thousands of verified<br />
                  listings from trusted dealers.<br />
                  Contact sellers directly via WhatsApp.
                </div>
                <motion.div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
                  {["🚗 Cars","🏍️ Bikes","🚛 Commercial","✅ Free to list"].map((tag, i) => (
                    <motion.span key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.12 }}
                      style={{ fontSize: 11, background: "#0099FF18", color: "#0099FF", border: "1px solid #0099FF33", borderRadius: 20, padding: "4px 10px", fontWeight: 600 }}>
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scene 5: CTA ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {scene === 5 && (
            <motion.div key="s5" className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                style={{ fontSize: 68, fontWeight: 900, color: "#0099FF", letterSpacing: -2 }}
                initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: "spring", stiffness: 160 }}
                whileInView={{ textShadow: ["0 0 20px #0099FF44","0 0 55px #0099FFBB","0 0 20px #0099FF44"] }}>
                motokah.com
              </motion.div>
              <motion.div style={{ color: "#E8A835", fontSize: 18, fontWeight: 600, letterSpacing: 1.5, marginTop: 10 }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                Free to list · Free to browse
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Fade out (scene 6) ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {scene === 6 && (
            <motion.div key="s6" className="absolute inset-0" style={{ background: "#0F1419" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
          )}
        </AnimatePresence>

        {/* Persistent watermark */}
        <div style={{ position: "absolute", bottom: 14, right: 22, fontSize: 10, color: "#2a2a3a", letterSpacing: 3 }}>MOTOKAH</div>
      </div>
    </div>
  );
}
