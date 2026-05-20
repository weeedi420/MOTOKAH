import { useRef, useEffect, useState, useCallback, type ComponentType } from "react";
import { VideoContext } from "./compat";
import { TIMING } from "./timing";

const FPS = TIMING.fps;
const TOTAL = TIMING.totalDuration; // 1512 frames = 50.4s
const W = 1280;
const H = 720;

function formatTime(f: number) {
  const s = f / FPS;
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

export function CustomPlayer({
  component: Comp,
  audioSrc,
}: {
  component: ComponentType;
  audioSrc?: string;
}) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);

  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const playingRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const syncAudio = useCallback((f: number, play: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = f / FPS;
    if (Math.abs(audio.currentTime - target) > 0.1) audio.currentTime = target;
    if (play && audio.paused) audio.play().catch(() => {});
    else if (!play && !audio.paused) audio.pause();
  }, []);

  useEffect(() => {
    const tick = (time: number) => {
      if (playingRef.current && lastTimeRef.current !== null) {
        const delta = time - lastTimeRef.current;
        frameRef.current += delta * FPS / 1000;
        if (frameRef.current >= TOTAL) frameRef.current = 0;
        const f = Math.floor(frameRef.current);
        setFrame(f);
        syncAudio(f, true);
      }
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [syncAudio]);

  const togglePlay = useCallback(() => {
    playingRef.current = !playingRef.current;
    setPlaying(p => !p);
    if (!playingRef.current) {
      lastTimeRef.current = null;
      syncAudio(frameRef.current, false);
    }
  }, [syncAudio]);

  const seek = useCallback((f: number) => {
    frameRef.current = f;
    lastTimeRef.current = null;
    setFrame(f);
    syncAudio(f, playingRef.current);
  }, [syncAudio]);

  const progress = frame / (TOTAL - 1);

  return (
    <div
      style={{ width: "100%", background: "#020508", borderRadius: 16, overflow: "hidden",
        boxShadow: "0 0 80px rgba(0,153,255,0.15), 0 40px 80px rgba(0,0,0,0.7)",
        border: "1px solid rgba(0,153,255,0.12)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Video canvas — scales 16:9 */}
      <div
        style={{ position: "relative", width: "100%", paddingTop: `${(H / W) * 100}%`, cursor: "pointer" }}
        onClick={togglePlay}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <VideoContext.Provider value={{ frame, fps: FPS, width: W, height: H, durationInFrames: TOTAL }}>
            <Comp />
          </VideoContext.Provider>
        </div>

        {/* Play overlay on pause */}
        {!playing && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(0,153,255,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(0,153,255,0.6)",
            }}>
              <span style={{ fontSize: 22, color: "#fff", marginLeft: 4 }}>▶</span>
            </div>
          </div>
        )}

        {/* Frame counter (top-right) */}
        <div style={{
          position: "absolute", top: 10, right: 12,
          background: "rgba(0,0,0,0.6)", borderRadius: 6,
          padding: "2px 8px", fontSize: 10, fontFamily: "monospace",
          color: "rgba(255,255,255,0.5)",
          opacity: hovered ? 1 : 0, transition: "opacity 0.2s",
        }}>
          {frame} / {TOTAL}
        </div>
      </div>

      {/* Controls bar */}
      <div style={{
        background: "#07090f", padding: "10px 14px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        {/* Progress bar */}
        <div style={{ position: "relative", height: 4, marginBottom: 10, cursor: "pointer" }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek(Math.round(((e.clientX - rect.left) / rect.width) * (TOTAL - 1)));
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.1)", borderRadius: 2 }} />
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${progress * 100}%`,
            background: "linear-gradient(to right, #0099FF, #00D4FF)",
            borderRadius: 2, transition: "width 0.033s linear",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: `${progress * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 12, height: 12, borderRadius: "50%",
            background: "#0099FF", boxShadow: "0 0 8px #0099FF",
          }} />
        </div>

        {/* Buttons + time */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={togglePlay}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#0099FF", fontSize: 18, padding: "0 4px", lineHeight: 1,
            }}
          >
            {playing ? "⏸" : "▶"}
          </button>

          <button
            onClick={() => seek(0)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.4)", fontSize: 14, padding: "0 4px",
            }}
          >
            ⏮
          </button>

          <span style={{
            fontSize: 11, fontFamily: "monospace", color: "#4a6070",
            marginLeft: 4,
          }}>
            {formatTime(frame)} / {formatTime(TOTAL)}
          </span>

          <div style={{ flex: 1 }} />

          <span style={{
            fontSize: 10, color: "rgba(232,168,53,0.7)", letterSpacing: 1,
            fontFamily: "Inter, sans-serif", fontWeight: 700,
          }}>
            50s · 30fps · 1280×720
          </span>

          <span style={{
            fontSize: 10, color: "rgba(255,255,255,0.25)",
            fontFamily: "Inter, sans-serif",
          }}>
            LOOP
          </span>
        </div>
      </div>

      {/* Hidden audio element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          loop={false}
          preload="auto"
          style={{ display: "none" }}
        />
      )}
    </div>
  );
}
