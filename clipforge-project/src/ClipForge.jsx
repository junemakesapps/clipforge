import { useState, useRef, useEffect, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

// --- Design Tokens ---
const T = {
  bg: "#111118",
  surface: "#1A1A24",
  surface2: "#222230",
  surface3: "#2A2A3A",
  text: "#F0F0F5",
  textMid: "#B0B0C0",
  textDim: "#6E6E85",
  border: "#2E2E40",
  accent: "#00E5A0",
  accentAlt: "#00C488",
  purple: "#A78BFA",
  pink: "#F472B6",
  blue: "#60A5FA",
  orange: "#FBBF24",
  red: "#FF0040",
  danger: "#FF4D6A",
  radius: 14,
};

const CATEGORIES = {
  key_insight: { label: "Key Insight", color: "#00E5A0", icon: "💡" },
  emotional: { label: "Emotional Peak", color: "#FF6B9D", icon: "🔥" },
  actionable: { label: "Actionable Tip", color: "#FBBF24", icon: "⚡" },
  viral_potential: { label: "Viral Potential", color: "#A78BFA", icon: "🚀" },
  story: { label: "Great Story", color: "#60A5FA", icon: "📖" },
  quotable: { label: "Quotable", color: "#F472B6", icon: "💬" },
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes breathe { 0%,100% { opacity: 0.5; } 50% { opacity: 0.8; } }
  @keyframes borderRotate { to { --angle: 360deg; } }
  @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.08); } }
  @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,25px) scale(0.95); } }
  @keyframes float3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,20px); } }
  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 30px rgba(0,229,160,0.08), 0 0 60px rgba(0,229,160,0.04), 0 8px 32px rgba(0,0,0,0.4); }
    50% { box-shadow: 0 0 40px rgba(0,229,160,0.14), 0 0 80px rgba(0,229,160,0.06), 0 8px 32px rgba(0,0,0,0.4); }
  }
  @keyframes shootingStar {
    0% { transform: translate(0, 0) rotate(225deg); opacity: 0; width: 0; }
    3% { opacity: 0.7; }
    50% { opacity: 0.4; }
    100% { transform: translate(400px, 400px) rotate(225deg); opacity: 0; width: 140px; }
  }
  @keyframes shootingStar2 {
    0% { transform: translate(0, 0) rotate(225deg); opacity: 0; width: 0; }
    3% { opacity: 0.6; }
    50% { opacity: 0.3; }
    100% { transform: translate(350px, 350px) rotate(225deg); opacity: 0; width: 110px; }
  }

  @keyframes glitchFlicker {
    0%, 94%, 100% { opacity: 0; }
    95% { opacity: 1; }
  }
  @keyframes glitchShift1 {
    0%, 90%, 100% { transform: translate(0, 0) scaleX(1); opacity: 0; }
    91% { transform: translate(-3px, -1px) scaleX(1.01); opacity: 0.08; }
    93% { transform: translate(2px, 1px) scaleX(0.99); opacity: 0.06; }
    94% { transform: translate(0, 0) scaleX(1); opacity: 0; }
  }
  @keyframes glitchShift2 {
    0%, 85%, 100% { transform: translate(0, 0); opacity: 0; }
    86% { transform: translate(4px, 0); opacity: 0.06; }
    88% { transform: translate(-2px, 1px); opacity: 0.04; }
    89% { transform: translate(0, 0); opacity: 0; }
  }
  @keyframes glitchLine {
    0%, 92%, 100% { transform: translateY(0); height: 0; }
    93% { transform: translateY(var(--glitch-y, 30vh)); height: 2px; }
    95% { transform: translateY(var(--glitch-y, 30vh)); height: 1px; }
    96% { height: 0; }
  }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes breatheRed {
    0%,100% { text-shadow: 0 0 8px rgba(240,48,96,0.16), 0 0 22px rgba(240,48,96,0.08); }
    50% { text-shadow: 0 0 14px rgba(240,48,96,0.28), 0 0 36px rgba(240,48,96,0.12); }
  }

  * { box-sizing: border-box; }

  .glass-card {
    position: relative;
    background: rgba(26,26,36,0.75);
    backdrop-filter: blur(20px) saturate(1.3);
    -webkit-backdrop-filter: blur(20px) saturate(1.3);
    border: 1px solid rgba(0,229,160,0.1);
    border-radius: 16px;
    animation: pulseGlow 5s ease-in-out infinite, fadeUp 0.6s ease-out both;
    transition: transform 0.3s ease, border-color 0.3s ease;
    overflow: hidden;
  }
  .glass-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(0,229,160,0.15), transparent 40%, transparent 60%, rgba(0,229,160,0.1));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
  .glass-card:hover {
    border-color: rgba(0,229,160,0.2);
  }

  .btn-primary {
    padding: 13px 22px;
    border-radius: 9px;
    border: 1.5px solid rgba(0,229,160,0.5);
    font-weight: 700;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    letter-spacing: -0.4px;
    cursor: pointer;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    justify-content: center;
    background: rgba(0,229,160,0.12);
    color: #00E5A0;
    box-shadow: 0 0 24px rgba(0,229,160,0.25), inset 0 0 12px rgba(0,229,160,0.06);
    text-shadow: 0 0 10px rgba(0,229,160,0.3);
  }
  .btn-primary:hover:not(:disabled) {
    background: rgba(0,229,160,0.2);
    border-color: rgba(0,229,160,0.7);
    box-shadow: 0 0 32px rgba(0,229,160,0.4), inset 0 0 16px rgba(0,229,160,0.08);
    text-shadow: 0 0 14px rgba(0,229,160,0.5);
    transform: translateY(-1px);
  }
  .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; text-shadow: none; }

  .btn-secondary {
    padding: 11px 22px;
    border-radius: 10px;
    border: 1px solid rgba(160,160,255,0.12);
    font-weight: 600;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(42,42,58,0.5);
    color: #F0F0F5;
    backdrop-filter: blur(8px);
  }
  .btn-secondary:hover:not(:disabled) {
    background: rgba(42,42,58,0.8);
    border-color: rgba(160,160,255,0.22);
    transform: translateY(-1px);
  }
  .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-ghost {
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #6E6E85;
    font-weight: 500;
    font-size: 13px;
    font-family: 'Outfit', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-ghost:hover { color: #B0B0C0; background: rgba(255,255,255,0.04); }

  .text-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid rgba(160,160,255,0.1);
    background: rgba(34,34,48,0.6);
    color: #F0F0F5;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .text-input:focus {
    border-color: rgba(0,229,160,0.4);
    box-shadow: 0 0 0 3px rgba(0,229,160,0.08);
  }
  .text-input::placeholder { color: #6E6E85; }

  .drop-zone {
    border: 2px dashed rgba(160,160,255,0.12);
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
  }
  .drop-zone:hover {
    border-color: rgba(0,229,160,0.35);
    background: rgba(0,229,160,0.03);
  }
`;

function parseTimestamp(ts) {
  if (!ts) return 0;
  const parts = ts.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function formatTime(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function extractYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// --- Interactive Background Layer ---
function BackgroundLayer() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 0.5, y: 0.5 });
  const currentRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMove = (e) => {
      targetRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", handleMove);

    const lerp = (a, b, t) => a + (b - a) * t;
    const animate = () => {
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.04);
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.04);
      setMouse({ x: currentRef.current.x, y: currentRef.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const mx = mouse.x;
  const my = mouse.y;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {/* Orb 1 - follows mouse closely */}
      <div style={{
        position: "absolute",
        left: `${mx * 100 - 20}%`,
        top: `${my * 100 - 20}%`,
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,229,160,0.09) 0%, transparent 60%)",
        filter: "blur(80px)",
        transition: "none",
      }} />
      {/* Orb 2 - inverse parallax */}
      <div style={{
        position: "absolute",
        right: `${mx * 30 - 5}%`,
        bottom: `${my * 25 - 5}%`,
        width: 700, height: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 60%)",
        filter: "blur(90px)",
      }} />
      {/* Orb 3 - slow drift */}
      <div style={{
        position: "absolute",
        left: `${40 + (mx - 0.5) * 15}%`,
        top: `${50 + (my - 0.5) * 15}%`,
        width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 60%)",
        filter: "blur(70px)",
      }} />
      {/* Orb 4 - pink accent */}
      <div style={{
        position: "absolute",
        left: `${60 + (0.5 - mx) * 20}%`,
        top: `${20 + (0.5 - my) * 20}%`,
        width: 350, height: 350,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(244,114,182,0.04) 0%, transparent 60%)",
        filter: "blur(60px)",
      }} />
      {/* Mouse spotlight */}
      <div style={{
        position: "absolute",
        left: `${mx * 100}%`,
        top: `${my * 100}%`,
        width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 60%)",
        transform: "translate(-50%, -50%)",
        filter: "blur(40px)",
      }} />
      {/* Shooting stars */}
      {[
        { top: "5%", left: "20%", delay: "0s", dur: "3.5s", anim: "shootingStar" },
        { top: "15%", left: "70%", delay: "4s", dur: "3s", anim: "shootingStar2" },
        { top: "40%", left: "8%", delay: "8s", dur: "4s", anim: "shootingStar" },
        { top: "10%", left: "90%", delay: "12s", dur: "3.2s", anim: "shootingStar2" },
        { top: "55%", left: "50%", delay: "16s", dur: "3.8s", anim: "shootingStar" },
        { top: "3%", left: "45%", delay: "20s", dur: "3.3s", anim: "shootingStar2" },
        { top: "30%", left: "80%", delay: "24s", dur: "3.6s", anim: "shootingStar" },
        { top: "65%", left: "25%", delay: "28s", dur: "3.1s", anim: "shootingStar2" },
      ].map((s, i) => (
        <div key={`star-${i}`} style={{
          position: "absolute", top: s.top, left: s.left,
          width: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 40%, rgba(0,229,160,0.3) 70%, transparent)",
          borderRadius: 1,
          animation: `${s.anim} ${s.dur} ease-out ${s.delay} infinite`,
          filter: "blur(0.2px)",
          boxShadow: "0 0 3px rgba(255,255,255,0.2)",
        }} />
      ))}
      {/* Grid - shifts with parallax */}
      <div style={{
        position: "absolute", inset: -40, opacity: 0.8,
        backgroundImage: "linear-gradient(rgba(160,160,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(160,160,255,0.09) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        backgroundPosition: `${(mx - 0.5) * 16}px ${(my - 0.5) * 16}px`,
      }} />
      {/* Noise */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" opacity="0.03" />
      </svg>
      {/* Glitch effects */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(transparent 50%, rgba(0,229,160,0.015) 50%)",
        backgroundSize: "100% 3px",
        animation: "glitchFlicker 8s step-end infinite",
        mixBlendMode: "screen",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        borderLeft: "1px solid rgba(0,229,160,0.06)",
        borderRight: "1px solid rgba(255,80,120,0.04)",
        animation: "glitchShift1 6s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        borderLeft: "1px solid rgba(80,160,255,0.04)",
        animation: "glitchShift2 9s ease-in-out infinite 2s",
      }} />
      {/* Glitch scan lines */}
      {[
        { y: "20vh", delay: "0s", dur: "7s" },
        { y: "55vh", delay: "3s", dur: "5s" },
        { y: "78vh", delay: "6s", dur: "8s" },
      ].map((line, i) => (
        <div key={`glitch-line-${i}`} style={{
          position: "absolute", left: 0, right: 0, top: 0, height: 0,
          background: `linear-gradient(90deg, transparent 5%, rgba(0,229,160,0.08) 20%, rgba(0,229,160,0.12) 50%, rgba(0,229,160,0.08) 80%, transparent 95%)`,
          "--glitch-y": line.y,
          animation: `glitchLine ${line.dur} step-end ${line.delay} infinite`,
        }} />
      ))}
      {/* Vignette - center follows mouse */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 80% 60% at ${mx * 100}% ${my * 100}%, transparent 15%, rgba(10,10,18,0.45) 100%)`,
      }} />
    </div>
  );
}

// --- Interactive Tilt Card ---
function TiltCard({ children, style: extraStyle, delay }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const targetRef = useRef({ x: 0, y: 0, mx: 50, my: 50 });
  const currentRef = useRef({ x: 0, y: 0, mx: 50, my: 50 });
  const rafRef = useRef(null);

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const animate = () => {
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.08);
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.08);
      currentRef.current.mx = lerp(currentRef.current.mx, targetRef.current.mx, 0.08);
      currentRef.current.my = lerp(currentRef.current.my, targetRef.current.my, 0.08);
      setTilt({ x: currentRef.current.x, y: currentRef.current.y });
      setMousePos({ x: currentRef.current.mx, y: currentRef.current.my });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    targetRef.current = {
      x: (y - 0.5) * -10,
      y: (x - 0.5) * 10,
      mx: x * 100,
      my: y * 100,
    };
  };

  const handleMouseLeave = () => {
    setHovering(false);
    targetRef.current = { x: 0, y: 0, mx: 50, my: 50 };
  };

  return (
    <div
      ref={cardRef}
      className="glass-card"
      onMouseMove={(e) => { handleMouseMove(e); setHovering(true); }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        ...extraStyle,
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovering ? "translateY(-4px) scale(1.01)" : ""}`,
        transition: hovering ? "border-color 0.3s" : "transform 0.5s ease-out, border-color 0.3s",
        animationDelay: delay || "0s",
      }}
    >
      {/* Mouse spotlight */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 16, pointerEvents: "none", zIndex: 1,
        opacity: hovering ? 1 : 0,
        transition: "opacity 0.4s ease",
        background: `radial-gradient(450px circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,229,160,0.14), transparent 50%)`,
      }} />
      {/* Edge highlight that follows cursor */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 16, pointerEvents: "none", zIndex: 1,
        opacity: hovering ? 1 : 0,
        transition: "opacity 0.4s ease",
        background: `radial-gradient(300px circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,229,160,0.12), transparent 50%)`,
        mixBlendMode: "screen",
      }} />
      {/* Glint that tracks along the edge */}
      <div style={{
        position: "absolute", inset: -1, borderRadius: 17, pointerEvents: "none", zIndex: 2,
        opacity: hovering ? 1 : 0,
        transition: "opacity 0.4s ease",
        background: `radial-gradient(200px circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,229,160,0.15), transparent 50%)`,
        padding: 1,
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }} />
      {/* Content */}
      <div style={{ position: "relative", zIndex: 3 }}>
        {children}
      </div>
    </div>
  );
}

// --- Split-Flap Display ---
function SplitFlapWords() {
  const words = ["Transcript AI", "Smart Clips", "FFmpeg Export", "AI Analysis", "One-Click Export"];
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState(words[0]);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlipping(true);
      const nextIndex = (index + 1) % words.length;
      const target = words[nextIndex];
      const maxLen = Math.max(displayText.length, target.length);
      let step = 0;

      const scramble = setInterval(() => {
        step++;
        setDisplayText((prev) => {
          let result = "";
          for (let i = 0; i < maxLen; i++) {
            if (i < step) {
              result += target[i] || " ";
            } else if (i < prev.length) {
              result += "ABCDEFGHIJKLMNOPQRSTUVWXYZ "[Math.floor(Math.random() * 27)];
            }
          }
          return result.trimEnd();
        });
        if (step >= maxLen) {
          clearInterval(scramble);
          setDisplayText(target);
          setFlipping(false);
          setIndex(nextIndex);
        }
      }, 45);
    }, 3000);
    return () => clearInterval(interval);
  }, [index, displayText]);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11, letterSpacing: "0.5px",
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#E0976A", opacity: 0.7, flexShrink: 0 }} />
      <div style={{
        display: "inline-flex", gap: 0, overflow: "hidden", minWidth: 120,
      }}>
        {displayText.split("").map((char, i) => (
          <span key={i} style={{
            display: "inline-block", width: char === " " ? 5 : "auto",
            padding: "2px 1px",
            color: flipping && i >= displayText.indexOf(char) ? "#FFAA66" : "#E0976A",
            background: flipping ? "rgba(224,151,106,0.05)" : "transparent",
            borderRadius: 2,
            transition: "color 0.1s",
          }}>{char}</span>
        ))}
      </div>
    </div>
  );
}

// --- Header ---
function Header({ onPricing, plan, usage, limit }) {
  return (
    <header style={{
      padding: "16px 28px", borderBottom: "1px solid rgba(160,160,255,0.06)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: "rgba(17,17,24,0.8)", backdropFilter: "blur(20px) saturate(1.2)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: `linear-gradient(135deg, ${T.accent}, ${T.accentAlt})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: T.bg, boxShadow: `0 0 20px rgba(0,229,160,0.3)`,
        }}>✂</div>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.4px", color: T.text, fontFamily: "'Outfit', sans-serif" }}>
          ClipForge
        </span>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
          color: T.accent, background: "rgba(0,229,160,0.1)", padding: "3px 8px", borderRadius: 5,
          border: "1px solid rgba(0,229,160,0.15)",
        }}>AI</span>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, 
        fontFamily: "'Outfit', sans-serif",
      }}>
        <span style={{
          fontSize: 12, color: T.textDim, fontWeight: 400, letterSpacing: "-0.1px",
        }}>Paste a transcript.</span>
        <span style={{
          fontSize: 12, color: T.textMid, fontWeight: 500, letterSpacing: "-0.1px",
        }}>AI finds the clips.</span>
        <span style={{
          fontSize: 12, color: T.accent, fontWeight: 600, letterSpacing: "-0.1px",
        }}>Export in seconds.</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <SplitFlapWords />
          {plan === "free" && (
            <span style={{
              fontSize: 10, color: T.textDim, fontFamily: "'JetBrains Mono', monospace",
              background: "rgba(160,160,255,0.06)", padding: "3px 8px", borderRadius: 5,
              border: "1px solid rgba(160,160,255,0.08)",
            }}>{usage}/{limit}</span>
          )}
          {plan !== "free" && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
              color: plan === "lifetime" ? "#A78BFA" : T.accent,
              background: plan === "lifetime" ? "rgba(167,139,250,0.1)" : "rgba(0,229,160,0.1)",
              padding: "3px 8px", borderRadius: 5,
              border: `1px solid ${plan === "lifetime" ? "rgba(167,139,250,0.15)" : "rgba(0,229,160,0.15)"}`,
            }}>{plan === "lifetime" ? "LIFETIME" : "PRO"}</span>
          )}
          <button onClick={onPricing} style={{
            background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.2)",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: 12, fontWeight: 600, color: T.accent,
            fontFamily: "'Outfit', sans-serif", transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(0,229,160,0.18)"; e.target.style.borderColor = "rgba(0,229,160,0.35)"; }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(0,229,160,0.1)"; e.target.style.borderColor = "rgba(0,229,160,0.2)"; }}
          >
            {plan === "free" ? "Upgrade" : "Plan"}
          </button>
      </div>
    </header>
  );
}

// --- Step indicator ---
function Steps({ step }) {
  const steps = ["Source", "Transcript", "Analysis", "Export"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 40, animation: "fadeIn 0.4s ease-out" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: i < step ? `linear-gradient(135deg, ${T.accent}, ${T.accentAlt})`
                : i === step ? "rgba(0,229,160,0.15)" : "rgba(46,46,64,0.5)",
              border: i === step ? `1.5px solid ${T.accent}` : "1.5px solid transparent",
              color: i < step ? T.bg : i === step ? T.accent : T.textDim,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
              transition: "all 0.4s ease",
              boxShadow: i <= step ? "0 0 12px rgba(0,229,160,0.15)" : "none",
            }}>{i < step ? "✓" : i + 1}</div>
            <span style={{
              fontSize: 13, fontWeight: i === step ? 700 : 500,
              color: i <= step ? T.text : T.textDim,
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: "-0.2px",
            }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: 32, height: 1, margin: "0 10px",
              background: i < step ? `linear-gradient(90deg, ${T.accent}60, ${T.accent}20)` : "rgba(46,46,64,0.5)",
              transition: "background 0.4s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// --- Clip card ---
function ClipCard({ clip, index, onToggle, onRemove, onAdjust, totalDuration }) {
  const cat = CATEGORIES[clip.category] || CATEGORIES.key_insight;
  const dur = clip.end - clip.start;
  return (
    <div style={{
      background: "rgba(26,26,36,0.6)", backdropFilter: "blur(12px)",
      border: `1px solid ${clip.selected ? cat.color + "33" : "rgba(46,46,64,0.4)"}`,
      borderRadius: 12, padding: 16, transition: "all 0.25s", opacity: clip.selected ? 1 : 0.55,
      animation: "fadeUp 0.4s ease-out both",
      animationDelay: `${index * 0.06}s`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15 }}>{cat.icon}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, color: cat.color, background: cat.color + "15",
            padding: "2px 9px", borderRadius: 5, textTransform: "uppercase", letterSpacing: "0.6px",
            border: `1px solid ${cat.color}20`, fontFamily: "'Outfit', sans-serif",
          }}>{cat.label}</span>
          <span style={{ fontSize: 11, color: T.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            {formatTime(clip.start)} → {formatTime(clip.end)}
          </span>
          <span style={{ fontSize: 11, color: T.textDim, opacity: 0.5 }}>({Math.round(dur)}s)</span>
        </div>
        <button onClick={() => onToggle(index)} style={{
          width: 22, height: 22, borderRadius: 6, border: `2px solid ${clip.selected ? T.accent : T.border}`,
          background: clip.selected ? T.accent : "transparent", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: T.bg, fontWeight: 800, transition: "all 0.2s",
          boxShadow: clip.selected ? `0 0 8px rgba(0,229,160,0.3)` : "none",
        }}>{clip.selected ? "✓" : ""}</button>
      </div>
      <p style={{ fontSize: 13, color: T.text, lineHeight: 1.55, margin: "0 0 10px 0", fontFamily: "'Outfit', sans-serif" }}>{clip.reason}</p>
      {clip.quote && (
        <p style={{
          fontSize: 12, color: T.textMid, fontStyle: "italic", margin: "0 0 12px 0",
          paddingLeft: 12, borderLeft: `2px solid ${cat.color}30`, lineHeight: 1.45,
          fontFamily: "'Outfit', sans-serif",
        }}>"{clip.quote}"</p>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: T.textDim, width: 32, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Start</span>
        <input type="range" min={0} max={totalDuration || 600} value={clip.start}
          onChange={(e) => onAdjust(index, "start", Number(e.target.value))}
          style={{ flex: 1, accentColor: cat.color, height: 3 }} />
        <span style={{ fontSize: 11, color: T.text, fontFamily: "'JetBrains Mono', monospace", width: 48, textAlign: "right" }}>{formatTime(clip.start)}</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: T.textDim, width: 32, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>End</span>
        <input type="range" min={0} max={totalDuration || 600} value={clip.end}
          onChange={(e) => onAdjust(index, "end", Number(e.target.value))}
          style={{ flex: 1, accentColor: cat.color, height: 3 }} />
        <span style={{ fontSize: 11, color: T.text, fontFamily: "'JetBrains Mono', monospace", width: 48, textAlign: "right" }}>{formatTime(clip.end)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button className="btn-ghost" onClick={() => onRemove(index)} style={{ fontSize: 11, padding: "4px 8px" }}>Remove</button>
      </div>
    </div>
  );
}

// --- Timeline ---
function Timeline({ clips, totalDuration }) {
  if (!totalDuration || totalDuration <= 0) return null;
  return (
    <div style={{ marginBottom: 20, animation: "fadeUp 0.5s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.5px", textTransform: "uppercase" }}>Timeline</span>
        <span style={{ fontSize: 11, color: T.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{formatTime(totalDuration)}</span>
      </div>
      <div style={{
        height: 36, background: "rgba(26,26,36,0.6)", borderRadius: 8,
        position: "relative", overflow: "hidden",
        border: "1px solid rgba(160,160,255,0.06)",
        backdropFilter: "blur(8px)",
      }}>
        {clips.filter((c) => c.selected).map((clip, i) => {
          const cat = CATEGORIES[clip.category] || CATEGORIES.key_insight;
          const left = (clip.start / totalDuration) * 100;
          const width = Math.max(0.4, ((clip.end - clip.start) / totalDuration) * 100);
          return (
            <div key={i} title={`${cat.label}: ${formatTime(clip.start)} - ${formatTime(clip.end)}`}
              style={{
                position: "absolute", left: `${left}%`, width: `${width}%`, height: "100%",
                background: `linear-gradient(180deg, ${cat.color}40, ${cat.color}15)`,
                borderLeft: `2px solid ${cat.color}90`, transition: "all 0.35s ease",
              }} />
          );
        })}
      </div>
    </div>
  );
}

// --- Pricing Page ---
function PricingPage({ onClose, onSelectPlan, currentPlan, usage, limit }) {
  const handleCheckout = async (planId) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (data.error) alert(data.error);
    } catch { alert("Checkout unavailable. Please try again."); }
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Try ClipForge risk-free",
      features: [
        `${limit} analyses per month`,
        "All clip categories",
        "JSON export",
        "FFmpeg commands",
      ],
      cta: currentPlan === "free" ? "Current Plan" : "Downgrade",
      disabled: currentPlan === "free",
      accent: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$12",
      period: "/month",
      desc: "For creators who clip daily",
      features: [
        "Unlimited analyses",
        "All clip categories",
        "Priority AI processing",
        "JSON + FFmpeg + summary export",
        "Email support",
      ],
      cta: "Upgrade to Pro",
      disabled: currentPlan === "pro",
      accent: true,
      badge: "MOST POPULAR",
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: "$49",
      period: "one-time",
      desc: "Pay once, clip forever",
      features: [
        "Everything in Pro",
        "Lifetime access",
        "All future features",
        "Priority support",
        "Early access to new tools",
      ],
      cta: "Get Lifetime Access",
      disabled: currentPlan === "lifetime",
      accent: false,
      badge: "BEST VALUE",
    },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(10,10,18,0.85)", backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.3s ease-out",
    }} onClick={onClose}>
      <div style={{
        maxWidth: 880, width: "100%", padding: "0 20px",
        animation: "fadeUp 0.4s ease-out",
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{
            fontSize: 36, fontWeight: 800, letterSpacing: "-1px",
            fontFamily: "'Outfit', sans-serif", marginBottom: 8,
            background: `linear-gradient(135deg, ${T.text} 0%, ${T.accent} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Choose your plan</h2>
          <p style={{ fontSize: 15, color: T.textMid, fontFamily: "'Outfit', sans-serif" }}>
            {currentPlan === "free" ? `You've used ${usage} of ${limit} free analyses this month.` : `You're on the ${currentPlan} plan.`}
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "stretch" }}>
          {plans.map((p) => (
            <div key={p.id} className="glass-card" style={{
              padding: 28, display: "flex", flexDirection: "column",
              border: p.accent ? "1.5px solid rgba(0,229,160,0.35)" : undefined,
              position: "relative",
            }}>
              {p.badge && (
                <div style={{
                  position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                  background: p.accent ? `linear-gradient(135deg, ${T.accent}, ${T.accentAlt})` : "rgba(167,139,250,0.9)",
                  color: "#111118", fontSize: 9, fontWeight: 800, letterSpacing: "1.2px",
                  padding: "4px 12px", borderRadius: "0 0 6px 6px",
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  {p.badge}
                </div>
              )}
              <div style={{ marginTop: p.badge ? 8 : 0 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, fontFamily: "'Outfit', sans-serif" }}>{p.name}</h3>
                <p style={{ fontSize: 12, color: T.textDim, marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>{p.desc}</p>
              </div>
              <div style={{ marginBottom: 20, display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{
                  fontSize: 40, fontWeight: 800, letterSpacing: "-1.5px",
                  fontFamily: "'Outfit', sans-serif",
                  color: p.accent ? T.accent : T.text,
                }}>{p.price}</span>
                <span style={{ fontSize: 14, color: T.textDim, fontFamily: "'Outfit', sans-serif" }}>{p.period}</span>
              </div>
              <div style={{ flex: 1, marginBottom: 20 }}>
                {p.features.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
                    fontSize: 13, color: T.textMid, fontFamily: "'Outfit', sans-serif",
                  }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: "50%",
                      background: p.accent ? "rgba(0,229,160,0.15)" : "rgba(160,160,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, color: p.accent ? T.accent : T.textDim, flexShrink: 0,
                    }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <button
                className={p.accent ? "btn-primary" : "btn-secondary"}
                disabled={p.disabled}
                onClick={() => {
                  if (p.id === "free") { onSelectPlan("free"); onClose(); }
                  else handleCheckout(p.id);
                }}
                style={{ width: "100%", ...(p.disabled ? {} : {}) }}
              >
                {p.disabled ? "✓ Current Plan" : p.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Close */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: 13 }}>
            ← Back to ClipForge
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN APP =====================
export default function ClipForge() {
  const [step, setStep] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  const [usageCount, setUsageCount] = useState(() => {
    try { return parseInt(window.sessionStorage?.getItem("cf_usage") || "0"); } catch { return 0; }
  });
  const [plan, setPlan] = useState("free"); // "free" | "pro" | "lifetime"
  const [transcribeUsage, setTranscribeUsage] = useState(() => {
    try { return parseInt(window.sessionStorage?.getItem("cf_transcribe_usage") || "0"); } catch { return 0; }
  });
  const [videoSource, setVideoSource] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState(600);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFFmpeg, setShowFFmpeg] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const [activeClipIdx, setActiveClipIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState("");
  const [compiledUrl, setCompiledUrl] = useState(null);
  const [transition, setTransition] = useState("fade");
  const [transcribing, setTranscribing] = useState(false);
  const [transcribeProgress, setTranscribeProgress] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9"); // "16:9" | "9:16" | "1:1"
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [captionStyle, setCaptionStyle] = useState("bold");
  const ffmpegRef = useRef(null);

  const TRANSITIONS = {
    none: { label: "Hard Cut", icon: "✂️", desc: "Instant cut between clips", ffmpeg: null },
    fade: { label: "Fade to Black", icon: "🌑", desc: "Classic dip to black", ffmpeg: "fadeblack" },
    dissolve: { label: "Dissolve", icon: "✨", desc: "Smooth blend between clips", ffmpeg: "dissolve" },
    wipeleft: { label: "Swipe Left", icon: "👈", desc: "Fast swipe transition", ffmpeg: "wipeleft" },
    wiperight: { label: "Swipe Right", icon: "👉", desc: "Fast swipe the other way", ffmpeg: "wiperight" },
    wipeup: { label: "Swipe Up", icon: "👆", desc: "Vertical swipe up", ffmpeg: "wipeup" },
    slideright: { label: "Slide Push", icon: "📱", desc: "Push slide like stories", ffmpeg: "slideright" },
    circleclose: { label: "Iris Close", icon: "🔵", desc: "Circle wipe like retro film", ffmpeg: "circleclose" },
    diagtr: { label: "Diagonal", icon: "📐", desc: "Diagonal wipe", ffmpeg: "diagtr" },
    pixelize: { label: "Pixelate", icon: "🟩", desc: "Pixel dissolve effect", ffmpeg: "pixelize" },
  };

  const CAPTION_STYLES = {
    bold: { label: "Bold", icon: "🅱️", desc: "Large bold text, dark box", fontsize: 42, boxEnabled: true, fontcolor: "white", boxcolor: "black@0.65", borderw: 0, y: "h-th-60" },
    classic: { label: "Classic", icon: "📺", desc: "White text, black outline", fontsize: 36, boxEnabled: false, fontcolor: "white", boxcolor: "", borderw: 3, y: "h-th-50" },
    minimal: { label: "Minimal", icon: "✦", desc: "Small subtle text", fontsize: 28, boxEnabled: false, fontcolor: "white@0.9", boxcolor: "", borderw: 2, y: "h-th-40" },
    top: { label: "Top Bar", icon: "⬆️", desc: "Text at top of frame", fontsize: 36, boxEnabled: true, fontcolor: "white", boxcolor: "black@0.65", borderw: 0, y: "30" },
    center: { label: "Center", icon: "🎯", desc: "Big centered text", fontsize: 48, boxEnabled: true, fontcolor: "white", boxcolor: "black@0.5", borderw: 0, y: "(h-th)/2" },
  };

  const ASPECT_RATIOS = {
    "16:9": { label: "16:9", icon: "🖥️", desc: "Landscape (YouTube)", w: 1920, h: 1080 },
    "9:16": { label: "9:16", icon: "📱", desc: "Vertical (TikTok/Reels)", w: 1080, h: 1920 },
    "1:1": { label: "1:1", icon: "⬜", desc: "Square (Instagram)", w: 1080, h: 1080 },
  };

  // Helper for base64 encoding large buffers
  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  };

  // Helper to load FFmpeg
  const loadFFmpeg = async () => {
    if (!ffmpegRef.current) {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => {
        if (compiling) setCompileProgress(`Processing... ${Math.round(progress * 100)}%`);
      });
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegRef.current = ffmpeg;
    }
    return ffmpegRef.current;
  };

  // ========== AUTO-TRANSCRIPTION ==========
  const FREE_TRANSCRIBE_LIMIT = 1;
  const isTranscribeLimited = plan === "free" && transcribeUsage >= FREE_TRANSCRIBE_LIMIT;

  const autoTranscribe = useCallback(async () => {
    if (!videoFile) return;
    if (isTranscribeLimited) { setShowPricing(true); return; }
    setTranscribing(true);
    setTranscribeProgress("Loading video processor...");
    setError("");

    try {
      const ffmpeg = await loadFFmpeg();
      setTranscribeProgress("Extracting audio from video...");

      const fileData = await fetchFile(videoFile);
      await ffmpeg.writeFile("input_av", fileData);

      // Extract audio as low-bitrate mono MP3 for speech recognition
      await ffmpeg.exec([
        "-i", "input_av", "-vn", "-ac", "1", "-ar", "16000", "-b:a", "32k", "-f", "mp3", "audio_full.mp3",
      ]);

      const audioData = await ffmpeg.readFile("audio_full.mp3");
      const audioSize = audioData.length;

      // Clean up video input
      try { await ffmpeg.deleteFile("input_av"); } catch {}

      // Split into chunks if needed (max ~2MB per chunk for Vercel body limit)
      const MAX_CHUNK_BYTES = 2 * 1024 * 1024;
      const CHUNK_SECS = 600; // 10 min chunks
      const estDuration = estimatedDuration || 600;
      const numChunks = audioSize > MAX_CHUNK_BYTES ? Math.ceil(estDuration / CHUNK_SECS) : 1;

      let allSegments = [];
      let fullText = "";

      if (numChunks <= 1) {
        // Single request
        setTranscribeProgress("Transcribing audio with AI...");
        const base64 = arrayBufferToBase64(audioData.buffer);
        const resp = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio: base64, offset: 0 }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Transcription failed");
        if (data.segments) allSegments = data.segments;
        fullText = data.text || "";
      } else {
        // Split audio into time-based chunks
        for (let i = 0; i < numChunks; i++) {
          const startSec = i * CHUNK_SECS;
          const chunkName = `chunk_${i}.mp3`;
          setTranscribeProgress(`Preparing chunk ${i + 1} of ${numChunks}...`);

          await ffmpeg.exec([
            "-i", "audio_full.mp3", "-ss", String(startSec), "-t", String(CHUNK_SECS), "-c", "copy", chunkName,
          ]);

          const chunkData = await ffmpeg.readFile(chunkName);
          const base64 = arrayBufferToBase64(chunkData.buffer);

          setTranscribeProgress(`Transcribing chunk ${i + 1} of ${numChunks}...`);
          const resp = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: base64, offset: startSec }),
          });
          const data = await resp.json();
          if (!resp.ok) throw new Error(data.error || `Transcription failed for chunk ${i + 1}`);

          if (data.segments) allSegments.push(...data.segments);
          fullText += (fullText ? " " : "") + (data.text || "");

          try { await ffmpeg.deleteFile(chunkName); } catch {}
        }
      }

      try { await ffmpeg.deleteFile("audio_full.mp3"); } catch {}

      // Format transcript with timestamps
      const formattedTranscript = allSegments.length > 0
        ? allSegments.map((s) => `${formatTime(Math.round(s.start))} ${s.text.trim()}`).join("\n")
        : fullText;

      setTranscript(formattedTranscript);
      setTranscribeProgress("");

      // Track usage
      const newCount = transcribeUsage + 1;
      setTranscribeUsage(newCount);
      try { window.sessionStorage?.setItem("cf_transcribe_usage", String(newCount)); } catch {}


    } catch (err) {
      console.error("Transcription error:", err);
      setError(`Transcription error: ${err.message}`);
      setTranscribeProgress("");
    } finally {
      setTranscribing(false);
    }
  }, [videoFile, estimatedDuration, isTranscribeLimited, transcribeUsage]);

  // ========== VIDEO COMPILATION ==========
  const compileVideo = useCallback(async () => {
    if (selectedClips.length === 0 || !videoFile) return;
    setCompiling(true);
    setCompileProgress("Loading video processor...");
    setCompiledUrl(null);

    try {
      const ffmpeg = await loadFFmpeg();
      setCompileProgress("Loading video file...");
      const fileData = await fetchFile(videoFile);
      await ffmpeg.writeFile("input.mp4", fileData);

      const transType = TRANSITIONS[transition]?.ffmpeg;
      const transDuration = 0.5;
      const ar = ASPECT_RATIOS[aspectRatio];
      const needsCrop = aspectRatio !== "16:9";
      const needsReencode = transType || needsCrop || captionsEnabled;
      const capStyle = CAPTION_STYLES[captionStyle] || CAPTION_STYLES.bold;

      // Build video filter for crop/aspect ratio
      let cropFilter = "";
      if (aspectRatio === "9:16") {
        cropFilter = "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920";
      } else if (aspectRatio === "1:1") {
        cropFilter = "crop=min(iw\\,ih):min(iw\\,ih):(iw-min(iw\\,ih))/2:(ih-min(iw\\,ih))/2,scale=1080:1080";
      } else {
        cropFilter = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2";
      }

      // Extract each clip
      const clipFiles = [];
      const clipDurations = [];
      for (let i = 0; i < selectedClips.length; i++) {
        const clip = selectedClips[i];
        const clipName = `clip_${String(i).padStart(3, "0")}.mp4`;
        const dur = clip.end - clip.start;
        clipDurations.push(dur);
        setCompileProgress(`Cutting clip ${i + 1} of ${selectedClips.length}...`);

        if (needsReencode) {
          // Build filter chain
          let filters = [cropFilter];

          // Add caption overlay
          if (captionsEnabled && clip.quote) {
            const safeText = (clip.quote || clip.reason || "").replace(/'/g, "\u2019").replace(/:/g, "\\:").replace(/\\/g, "").substring(0, 80);
            let drawtext = `drawtext=text='${safeText}':fontsize=${capStyle.fontsize}:fontcolor=${capStyle.fontcolor}:borderw=${capStyle.borderw}:bordercolor=black:x=(w-text_w)/2:y=${capStyle.y}`;
            if (capStyle.boxEnabled) {
              drawtext += `:box=1:boxcolor=${capStyle.boxcolor}:boxborderw=12`;
            }
            filters.push(drawtext);
          }

          await ffmpeg.exec([
            "-i", "input.mp4",
            "-ss", String(clip.start),
            "-to", String(clip.end),
            "-vf", filters.join(","),
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "128k",
            "-pix_fmt", "yuv420p",
            "-avoid_negative_ts", "make_zero",
            clipName,
          ]);
        } else {
          await ffmpeg.exec([
            "-i", "input.mp4",
            "-ss", String(clip.start),
            "-to", String(clip.end),
            "-c", "copy",
            "-avoid_negative_ts", "make_zero",
            clipName,
          ]);
        }
        clipFiles.push(clipName);
      }

      if (!transType || selectedClips.length === 1) {
        // Simple concat
        setCompileProgress("Merging clips...");
        const concatList = clipFiles.map((f) => `file '${f}'`).join("\n");
        await ffmpeg.writeFile("concat.txt", new TextEncoder().encode(concatList));
        await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "concat.txt", "-c", "copy", "compilation.mp4"]);
        await ffmpeg.deleteFile("concat.txt");
      } else {
        // Apply xfade transitions
        setCompileProgress("Applying transitions...");
        let currentInput = clipFiles[0];
        let currentDuration = clipDurations[0];

        for (let i = 1; i < clipFiles.length; i++) {
          const outputName = i === clipFiles.length - 1 ? "compilation.mp4" : `merged_${i}.mp4`;
          const offset = Math.max(0, currentDuration - transDuration);

          setCompileProgress(`Applying transition ${i} of ${clipFiles.length - 1}...`);
          await ffmpeg.exec([
            "-i", currentInput, "-i", clipFiles[i],
            "-filter_complex",
            `[0:v][1:v]xfade=transition=${transType}:duration=${transDuration}:offset=${offset}[v];[0:a][1:a]acrossfade=d=${transDuration}[a]`,
            "-map", "[v]", "-map", "[a]",
            "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23",
            "-c:a", "aac", "-pix_fmt", "yuv420p",
            outputName,
          ]);

          if (i > 1) { try { await ffmpeg.deleteFile(currentInput); } catch {} }
          currentInput = outputName;
          currentDuration = currentDuration + clipDurations[i] - transDuration;
        }
      }

      const data = await ffmpeg.readFile("compilation.mp4");
      const blob = new Blob([data.buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setCompiledUrl(url);
      setCompileProgress("Done!");

      try { await ffmpeg.deleteFile("input.mp4"); } catch {}
      for (const f of clipFiles) { try { await ffmpeg.deleteFile(f); } catch {} }
    } catch (err) {
      console.error("Compilation error:", err);
      setCompileProgress(`Error: ${err.message}`);
    } finally {
      setCompiling(false);
    }
  }, [selectedClips, videoFile, transition, aspectRatio, captionsEnabled, captionStyle]);

  const FREE_LIMIT = 3;
  const isLimited = plan === "free" && usageCount >= FREE_LIMIT;

  const youtubeId = extractYouTubeId(youtubeUrl);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) { setVideoFile(file); setVideoUrl(URL.createObjectURL(file)); setVideoSource("file"); }
  };
  const handleVideoLoaded = (e) => {
    if (e.target.duration && isFinite(e.target.duration)) setEstimatedDuration(Math.round(e.target.duration));
  };

  const analyzeTranscript = async () => {
    if (isLimited) { setShowPricing(true); return; }
    if (!transcript.trim()) { setError("Please paste a transcript first."); return; }
    setLoading(true); setError(""); setStep(2);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcript.slice(0, 6000),
          duration: formatTime(estimatedDuration),
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const text = data.content?.map((b) => b.text || "").join("") || data.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      let parsed;
      try { parsed = JSON.parse(clean); } catch { throw new Error("AI response wasn't valid JSON. Try again."); }
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("No clips identified. Try a longer transcript.");
      setClips(parsed.map((c) => ({
        start: parseTimestamp(c.start), end: parseTimestamp(c.end),
        category: c.category || "key_insight", reason: c.reason || "",
        quote: c.quote || "", selected: true,
      })));
      setStep(3);
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      try { window.sessionStorage?.setItem("cf_usage", String(newCount)); } catch {}
    } catch (err) {
      setError(err.message || "Analysis failed."); setStep(1);
    } finally { setLoading(false); }
  };

  const toggleClip = (i) => setClips((p) => p.map((c, j) => j === i ? { ...c, selected: !c.selected } : c));
  const removeClip = (i) => setClips((p) => p.filter((_, j) => j !== i));
  const adjustClip = (i, field, value) => {
    setClips((p) => p.map((c, j) => {
      if (j !== i) return c;
      const u = { ...c, [field]: value };
      if (u.start >= u.end) { if (field === "start") u.end = Math.min(u.start + 5, estimatedDuration); else u.start = Math.max(u.end - 5, 0); }
      return u;
    }));
  };
  const addManualClip = () => setClips((p) => [...p, { start: 0, end: Math.min(30, estimatedDuration), category: "key_insight", reason: "Manually added clip", quote: "", selected: true }]);
  const selectedClips = clips.filter((c) => c.selected);
  const totalClipDuration = selectedClips.reduce((s, c) => s + (c.end - c.start), 0);
  const exportClipData = () => {
    const d = { source: videoSource === "youtube" ? youtubeUrl : videoFile?.name, totalDuration: estimatedDuration, clips: selectedClips.map((c) => ({ start: formatTime(c.start), end: formatTime(c.end), startSeconds: c.start, endSeconds: c.end, category: c.category, reason: c.reason, quote: c.quote })), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "clipforge-export.json"; a.click(); URL.revokeObjectURL(url);
  };
  const generateFFmpegCommands = () => {
    const fn = videoSource === "youtube" ? "input.mp4" : videoFile?.name || "input.mp4";
    return selectedClips.map((c, i) => `ffmpeg -i "${fn}" -ss ${c.start} -to ${c.end} -c copy "clip_${String(i + 1).padStart(2, "0")}.mp4"`).join("\n");
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = "Clip #,Start,End,Duration,Category,Reason,Quote";
    const rows = selectedClips.map((c, i) =>
      `${i + 1},"${formatTime(c.start)}","${formatTime(c.end)}","${formatTime(c.end - c.start)}","${CATEGORIES[c.category]?.label || c.category}","${(c.reason || "").replace(/"/g, '""')}","${(c.quote || "").replace(/"/g, '""')}"`
    );
    downloadFile([header, ...rows].join("\n"), "clipforge-clips.csv", "text/csv");
  };

  const exportSRT = () => {
    const srt = selectedClips.map((c, i) => {
      const toSRT = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        const ms = Math.round((s % 1) * 1000);
        return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")},${String(ms).padStart(3,"0")}`;
      };
      return `${i + 1}\n${toSRT(c.start)} --> ${toSRT(c.end)}\n${c.quote || c.reason || `Clip ${i + 1}`}\n`;
    }).join("\n");
    downloadFile(srt, "clipforge-clips.srt", "text/srt");
  };

  const exportTXT = () => {
    const src = videoSource === "youtube" ? youtubeUrl : videoFile?.name || "video";
    const header = `ClipForge Export — ${new Date().toLocaleDateString()}\nSource: ${src}\nTotal Duration: ${formatTime(estimatedDuration)}\nClips: ${selectedClips.length} selected (${formatTime(totalClipDuration)} total)\n${"─".repeat(50)}\n`;
    const body = selectedClips.map((c, i) =>
      `\nClip ${i + 1} — ${CATEGORIES[c.category]?.label || c.category}\n  Time: ${formatTime(c.start)} → ${formatTime(c.end)} (${formatTime(c.end - c.start)})\n  Why:  ${c.reason || "N/A"}\n  Quote: "${c.quote || "N/A"}"`
    ).join("\n");
    downloadFile(header + body, "clipforge-clips.txt", "text/plain");
  };

  const exportEDL = () => {
    const fn = videoSource === "youtube" ? "input.mp4" : videoFile?.name || "input.mp4";
    const header = `TITLE: ClipForge Export\nFCM: NON-DROP FRAME\n\n`;
    const toTC = (s) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = Math.floor(s % 60);
      const fr = Math.round((s % 1) * 30);
      return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}:${String(fr).padStart(2,"0")}`;
    };
    let recPos = 0;
    const events = selectedClips.map((c, i) => {
      const dur = c.end - c.start;
      const line = `${String(i + 1).padStart(3,"0")}  001  V  C  ${toTC(c.start)} ${toTC(c.end)} ${toTC(recPos)} ${toTC(recPos + dur)}`;
      recPos += dur;
      return `${line}\n* FROM CLIP NAME: ${fn}\n* COMMENT: ${c.reason || `Clip ${i + 1}`}\n`;
    }).join("\n");
    downloadFile(header + events, "clipforge-clips.edl", "text/plain");
  };

  const exportXML = () => {
    const fn = videoSource === "youtube" ? "input.mp4" : videoFile?.name || "input.mp4";
    const fps = 30;
    const toFrames = (s) => Math.round(s * fps);
    const markers = selectedClips.map((c, i) =>
      `    <marker>\n      <name>Clip ${i + 1} — ${CATEGORIES[c.category]?.label || c.category}</name>\n      <in>${toFrames(c.start)}</in>\n      <out>${toFrames(c.end)}</out>\n      <comment>${c.reason || ""}</comment>\n    </marker>`
    ).join("\n");
    const clips = selectedClips.map((c, i) =>
      `      <clipitem id="clip-${i + 1}">\n        <name>Clip ${i + 1}</name>\n        <start>${toFrames(c.start)}</start>\n        <end>${toFrames(c.end)}</end>\n        <in>${toFrames(c.start)}</in>\n        <out>${toFrames(c.end)}</out>\n        <file id="file-1">\n          <name>${fn}</name>\n          <pathurl>${fn}</pathurl>\n        </file>\n      </clipitem>`
    ).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE xmeml>\n<xmeml version="5">\n  <sequence>\n    <name>ClipForge Export</name>\n    <rate><timebase>${fps}</timebase></rate>\n${markers}\n    <media>\n      <video>\n        <track>\n${clips}\n        </track>\n      </video>\n    </media>\n  </sequence>\n</xmeml>`;
    downloadFile(xml, "clipforge-clips.xml", "application/xml");
  };

  const exportMarkdown = () => {
    const src = videoSource === "youtube" ? youtubeUrl : videoFile?.name || "video";
    let md = `# ClipForge Export\n\n**Source:** ${src}  \n**Date:** ${new Date().toLocaleDateString()}  \n**Clips:** ${selectedClips.length} selected (${formatTime(totalClipDuration)} total)  \n\n---\n\n`;
    md += `| # | Start | End | Duration | Category | Reason |\n|---|-------|-----|----------|----------|--------|\n`;
    md += selectedClips.map((c, i) =>
      `| ${i + 1} | ${formatTime(c.start)} | ${formatTime(c.end)} | ${formatTime(c.end - c.start)} | ${CATEGORIES[c.category]?.label || c.category} | ${c.reason || "—"} |`
    ).join("\n");
    md += `\n\n---\n\n### Quotes\n\n`;
    md += selectedClips.filter(c => c.quote).map((c, i) =>
      `> "${c.quote}" — *${formatTime(c.start)}*`
    ).join("\n\n");
    downloadFile(md, "clipforge-clips.md", "text/markdown");
  };

  const EXPORT_FORMATS = [
    { id: "csv", icon: "📊", label: "CSV", desc: "Excel / Google Sheets", fn: exportCSV },
    { id: "txt", icon: "📝", label: "Summary", desc: "Plain text report", fn: exportTXT },
    { id: "srt", icon: "💬", label: "SRT", desc: "Subtitles / captions", fn: exportSRT },
    { id: "edl", icon: "🎬", label: "EDL", desc: "Premiere / Resolve", fn: exportEDL },
    { id: "xml", icon: "🎞️", label: "FCPXML", desc: "Final Cut / Premiere", fn: exportXML },
    { id: "md", icon: "📑", label: "Markdown", desc: "Notion / blogs", fn: exportMarkdown },
    { id: "json", icon: "{ }", label: "JSON", desc: "Developer / API", fn: exportClipData },
  ];

  const F = "'Outfit', sans-serif";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: F, position: "relative" }}>
      <style>{GLOBAL_CSS}</style>
      <BackgroundLayer />

      {/* Top accent line */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 1, zIndex: 100, pointerEvents: "none",
        background: `linear-gradient(90deg, transparent 10%, ${T.accent}50 35%, ${T.accent}90 50%, ${T.accent}50 65%, transparent 90%)`,
      }} />

      <Header onPricing={() => setShowPricing(true)} plan={plan} usage={usageCount} limit={FREE_LIMIT} />

      {/* Pricing Modal */}
      {showPricing && (
        <PricingPage
          onClose={() => setShowPricing(false)}
          onSelectPlan={(p) => setPlan(p)}
          currentPlan={plan}
          usage={usageCount}
          limit={FREE_LIMIT}
        />
      )}

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1 }}>
        <Steps step={step} />

        {/* ===== STEP 0: SOURCE ===== */}
        {step === 0 && (
          <div style={{ animation: "fadeUp 0.5s ease-out" }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h1 style={{
                fontSize: 44, fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.1,
                marginBottom: 12, fontFamily: F,
                background: `linear-gradient(135deg, ${T.text} 0%, ${T.textMid} 50%, ${T.accent} 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Clip the moments<br />that matter.
              </h1>
              <p style={{
                fontSize: 16, color: T.textMid, maxWidth: 480, margin: "0 auto", lineHeight: 1.6,
                fontWeight: 400,
              }}>
                AI finds your best moments. Auto-transcribe, crop for TikTok, add captions, and export a ready-to-post compilation — all in your browser.
              </p>
            </div>

            {/* Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "stretch" }}>
              {/* YouTube card */}
              <TiltCard style={{ padding: 24, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>🔗</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, fontFamily: F }}>YouTube URL</h3>
                </div>
                <p style={{ fontSize: 12, color: T.textDim, marginBottom: 16, fontFamily: F }}>Paste any YouTube video link</p>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  {youtubeId ? (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "16/9", marginBottom: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${youtubeId}`}
                          frameBorder="0" allowFullScreen style={{ borderRadius: 10 }} />
                      </div>
                      <input className="text-input" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..." />
                    </div>
                  ) : (
                    <div className="drop-zone" style={{
                      padding: 28, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", marginBottom: 14, height: 130,
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 10, color: "#F03060", opacity: 0.9, animation: "breatheRed 4s ease-in-out infinite" }}>▶</div>
                      <input className="text-input" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        style={{ textAlign: "center", background: "transparent" }} />
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", justifyContent: "center" }}>
                  <button className="btn-primary" style={{ width: "100%", fontSize: 15, letterSpacing: "-0.4px" }} disabled={!youtubeId}
                    onClick={() => { if (youtubeId) { setVideoSource("youtube"); setStep(1); } }}>
                    Continue with YouTube
                    <span style={{ fontSize: 15, lineHeight: 1 }}>→</span>
                  </button>
                </div>
              </TiltCard>

              {/* Upload card */}
              <TiltCard style={{ padding: 24, display: "flex", flexDirection: "column" }} delay="0.1s">
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>📁</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, fontFamily: F }}>Upload File</h3>
                </div>
                <p style={{ fontSize: 12, color: T.textDim, marginBottom: 16, fontFamily: F }}>MP4, MOV, WebM supported</p>

                <input ref={fileRef} type="file" accept="video/*" onChange={handleFileUpload} style={{ display: "none" }} />
                <div className="drop-zone" onClick={() => fileRef.current?.click()} style={{
                  padding: videoFile ? 8 : 28, textAlign: "center", marginBottom: 14, height: 130,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  {videoFile ? (
                    <video ref={videoRef} src={videoUrl} onLoadedMetadata={handleVideoLoaded}
                      style={{ width: "100%", borderRadius: 8 }} controls />
                  ) : (
                    <>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, marginBottom: 10,
                        background: "rgba(160,160,255,0.06)", border: "1px solid rgba(160,160,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, color: T.textDim,
                      }}>⬆</div>
                      <span style={{ fontSize: 13, color: T.textDim, fontFamily: F }}>Click or drag to upload</span>
                    </>
                  )}
                </div>

                <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", justifyContent: "center" }}>
                  <button className="btn-primary" style={{ width: "100%", fontSize: 15, letterSpacing: "-0.4px" }} disabled={!videoFile}
                    onClick={() => { if (videoFile) setStep(1); }}>
                    Continue with File
                    <span style={{ fontSize: 15, lineHeight: 1 }}>→</span>
                  </button>
                </div>
              </TiltCard>
            </div>

            {/* ===== FEATURES SHOWCASE ===== */}
            <div style={{ marginTop: 48 }}>
              <h2 style={{
                fontSize: 24, fontWeight: 800, textAlign: "center", letterSpacing: "-0.5px",
                marginBottom: 8,
                background: `linear-gradient(135deg, ${T.text}, ${T.accent})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Everything you need. One tool.</h2>
              <p style={{ textAlign: "center", fontSize: 14, color: T.textDim, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
                No more juggling 5 apps. Upload → Transcribe → Clip → Export.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Auto-Transcribe */}
                <div style={{
                  background: "rgba(26,26,36,0.6)", border: "1px solid rgba(0,229,160,0.12)",
                  borderRadius: 14, padding: 20, position: "relative", overflow: "hidden",
                  animation: "fadeUp 0.5s ease-out 0.1s both",
                }}>
                  <div style={{
                    position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,229,160,0.08), transparent)", pointerEvents: "none",
                  }} />
                  <div style={{ fontSize: 28, marginBottom: 10 }}>🎤</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5, letterSpacing: "-0.3px" }}>Auto-Transcribe</h3>
                  <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5, margin: 0 }}>
                    Upload a video and get a full timestamped transcript automatically. No copy-pasting from other tools.
                  </p>
                  <div style={{
                    marginTop: 12, display: "inline-block", fontSize: 10, fontWeight: 600,
                    color: T.accent, background: "rgba(0,229,160,0.08)",
                    padding: "3px 10px", borderRadius: 5, border: "1px solid rgba(0,229,160,0.1)",
                  }}>Powered by Whisper AI</div>
                </div>

                {/* AI Clip Detection */}
                <div style={{
                  background: "rgba(26,26,36,0.6)", border: "1px solid rgba(140,120,255,0.12)",
                  borderRadius: 14, padding: 20, position: "relative", overflow: "hidden",
                  animation: "fadeUp 0.5s ease-out 0.2s both",
                }}>
                  <div style={{
                    position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(140,120,255,0.08), transparent)", pointerEvents: "none",
                  }} />
                  <div style={{ fontSize: 28, marginBottom: 10 }}>🧠</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5, letterSpacing: "-0.3px" }}>AI Clip Detection</h3>
                  <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5, margin: 0 }}>
                    AI analyzes your transcript and finds the most shareable, engaging moments — hooks, insights, stories, and humor.
                  </p>
                  <div style={{
                    marginTop: 12, display: "inline-block", fontSize: 10, fontWeight: 600,
                    color: T.accentAlt, background: "rgba(140,120,255,0.08)",
                    padding: "3px 10px", borderRadius: 5, border: "1px solid rgba(140,120,255,0.1)",
                  }}>Powered by Claude AI</div>
                </div>

                {/* Vertical Crop */}
                <div style={{
                  background: "rgba(26,26,36,0.6)", border: "1px solid rgba(255,120,180,0.12)",
                  borderRadius: 14, padding: 20, position: "relative", overflow: "hidden",
                  animation: "fadeUp 0.5s ease-out 0.3s both",
                }}>
                  <div style={{
                    position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(255,120,180,0.08), transparent)", pointerEvents: "none",
                  }} />
                  <div style={{ fontSize: 28, marginBottom: 10 }}>📱</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5, letterSpacing: "-0.3px" }}>Auto-Crop Vertical</h3>
                  <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5, margin: 0 }}>
                    One click to convert landscape video to 9:16 for TikTok, Reels & Shorts, or 1:1 for Instagram.
                  </p>
                  <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                    {["9:16", "1:1", "16:9"].map((r) => (
                      <span key={r} style={{
                        fontSize: 10, fontWeight: 600, color: "#FF78B4",
                        background: "rgba(255,120,180,0.08)", padding: "3px 8px", borderRadius: 5,
                        border: "1px solid rgba(255,120,180,0.1)",
                      }}>{r}</span>
                    ))}
                  </div>
                </div>

                {/* Captions */}
                <div style={{
                  background: "rgba(26,26,36,0.6)", border: "1px solid rgba(255,200,60,0.12)",
                  borderRadius: 14, padding: 20, position: "relative", overflow: "hidden",
                  animation: "fadeUp 0.5s ease-out 0.4s both",
                }}>
                  <div style={{
                    position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(255,200,60,0.08), transparent)", pointerEvents: "none",
                  }} />
                  <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5, letterSpacing: "-0.3px" }}>Burn-in Captions</h3>
                  <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5, margin: 0 }}>
                    Overlay styled captions onto your clips. Choose from 5 styles — bold, classic, minimal, top bar, or centered.
                  </p>
                  <div style={{
                    marginTop: 12, display: "inline-block", fontSize: 10, fontWeight: 600,
                    color: "#FFC83C", background: "rgba(255,200,60,0.08)",
                    padding: "3px 10px", borderRadius: 5, border: "1px solid rgba(255,200,60,0.1)",
                  }}>5 caption styles</div>
                </div>

                {/* Transitions */}
                <div style={{
                  background: "rgba(26,26,36,0.6)", border: "1px solid rgba(60,200,255,0.12)",
                  borderRadius: 14, padding: 20, position: "relative", overflow: "hidden",
                  animation: "fadeUp 0.5s ease-out 0.5s both",
                }}>
                  <div style={{
                    position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(60,200,255,0.08), transparent)", pointerEvents: "none",
                  }} />
                  <div style={{ fontSize: 28, marginBottom: 10 }}>✨</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5, letterSpacing: "-0.3px" }}>Pro Transitions</h3>
                  <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5, margin: 0 }}>
                    Fade, dissolve, swipe, slide, iris, pixelate — 10 transition effects to make your compilations look polished.
                  </p>
                  <div style={{
                    marginTop: 12, display: "inline-block", fontSize: 10, fontWeight: 600,
                    color: "#3CC8FF", background: "rgba(60,200,255,0.08)",
                    padding: "3px 10px", borderRadius: 5, border: "1px solid rgba(60,200,255,0.1)",
                  }}>10 effects</div>
                </div>

                {/* MP4 Export */}
                <div style={{
                  background: "rgba(26,26,36,0.6)", border: "1px solid rgba(0,229,160,0.12)",
                  borderRadius: 14, padding: 20, position: "relative", overflow: "hidden",
                  animation: "fadeUp 0.5s ease-out 0.6s both",
                }}>
                  <div style={{
                    position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,229,160,0.08), transparent)", pointerEvents: "none",
                  }} />
                  <div style={{ fontSize: 28, marginBottom: 10 }}>🎬</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5, letterSpacing: "-0.3px" }}>One-Click MP4 Export</h3>
                  <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.5, margin: 0 }}>
                    Compile all clips into a single download-ready MP4. Plus CSV, SRT, EDL, FCPXML and 4 more formats.
                  </p>
                  <div style={{
                    marginTop: 12, display: "inline-block", fontSize: 10, fontWeight: 600,
                    color: T.accent, background: "rgba(0,229,160,0.08)",
                    padding: "3px 10px", borderRadius: 5, border: "1px solid rgba(0,229,160,0.1)",
                  }}>8 export formats</div>
                </div>
              </div>
            </div>

            {/* Trust strip */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 28, marginTop: 36,
              animation: "fadeIn 0.8s ease-out 0.7s both",
            }}>
              {[
                { icon: "🔒", text: "Runs in your browser" },
                { icon: "⚡", text: "No downloads needed" },
                { icon: "📱", text: "TikTok / Reels / Shorts ready" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: T.textDim, fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== STEP 1: TRANSCRIPT ===== */}
        {step === 1 && (
          <div style={{ animation: "fadeUp 0.5s ease-out" }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px" }}>Get your transcript</h2>
            <p style={{ color: T.textMid, fontSize: 15, marginBottom: 20, lineHeight: 1.5 }}>
              Choose how to provide the transcript for AI analysis.
            </p>

            {/* Auto-transcribe card */}
            {videoFile && (
              <TiltCard style={{ padding: 20, marginBottom: 20 }}>
                <div style={{ position: "relative", zIndex: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>🎤</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Auto-Transcribe</h3>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.8px",
                      background: "linear-gradient(135deg, #00E5A0, #00C488)", color: "#111118",
                      padding: "2px 8px", borderRadius: 4,
                    }}>RECOMMENDED</span>
                  </div>
                  <p style={{ fontSize: 12, color: T.textDim, marginBottom: 14 }}>
                    AI automatically extracts and transcribes audio from your video with timestamps. Powered by OpenAI Whisper.
                  </p>

                  {isTranscribeLimited ? (
                    <div style={{
                      background: "rgba(140,120,255,0.06)", border: "1px solid rgba(140,120,255,0.15)",
                      borderRadius: 10, padding: "14px 18px",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 3 }}>
                          Free transcription used
                        </div>
                        <div style={{ fontSize: 12, color: T.textDim }}>
                          Upgrade to Pro for unlimited auto-transcription, or paste a transcript manually below.
                        </div>
                      </div>
                      <button className="btn-primary" onClick={() => setShowPricing(true)} style={{ flexShrink: 0, padding: "8px 18px", fontSize: 13 }}>
                        Upgrade →
                      </button>
                    </div>
                  ) : (
                    <>
                      <button className="btn-primary" onClick={autoTranscribe}
                        disabled={transcribing}
                        style={{ fontSize: 15, padding: "14px 28px", width: "100%" }}>
                        {transcribing ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                            <span style={{
                              width: 14, height: 14, border: "2px solid rgba(0,229,160,0.3)",
                              borderTopColor: "#00E5A0", borderRadius: "50%",
                              animation: "spin 0.9s linear infinite", flexShrink: 0,
                            }} />
                            {transcribeProgress}
                          </span>
                        ) : "🎤 Auto-Transcribe Video"}
                      </button>
                      {!transcribing && (
                        <p style={{ fontSize: 11, color: T.textDim, marginTop: 8 }}>
                          ⚡ Takes 30-90 seconds depending on video length.
                          {plan === "free" && <span style={{ color: T.accentAlt }}> · {FREE_TRANSCRIBE_LIMIT - transcribeUsage} free transcription{FREE_TRANSCRIBE_LIMIT - transcribeUsage !== 1 ? "s" : ""} remaining</span>}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </TiltCard>
            )}

            {/* Divider */}
            {videoFile && (
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(160,160,255,0.1)" }} />
                <span style={{ fontSize: 12, color: T.textDim, fontWeight: 500 }}>or paste manually</span>
                <div style={{ flex: 1, height: 1, background: "rgba(160,160,255,0.1)" }} />
              </div>
            )}

            <div style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: T.textDim, fontWeight: 500 }}>Video duration:</span>
              <input className="text-input" type="number" value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                style={{ width: 80, textAlign: "center" }} min={1} />
              <span style={{ fontSize: 12, color: T.textDim, fontFamily: "'JetBrains Mono', monospace" }}>sec ({formatTime(estimatedDuration)})</span>
            </div>

            <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)}
              placeholder={`Paste your transcript here...\n\nExample:\n0:00 - Welcome to today's video...\n0:45 - The first thing you need to know...\n2:30 - Here's where it gets interesting...`}
              style={{
                width: "100%", minHeight: 260, padding: 18, borderRadius: 12,
                border: `1px solid ${transcript ? "rgba(0,229,160,0.2)" : "rgba(160,160,255,0.1)"}`,
                background: "rgba(26,26,36,0.6)",
                backdropFilter: "blur(12px)", color: T.text,
                fontSize: 13, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7,
                resize: "vertical", outline: "none",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(0,229,160,0.3)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,229,160,0.06)"; }}
              onBlur={(e) => { e.target.style.borderColor = transcript ? "rgba(0,229,160,0.2)" : "rgba(160,160,255,0.1)"; e.target.style.boxShadow = "none"; }}
            />
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 6, marginBottom: 20, fontFamily: "'JetBrains Mono', monospace" }}>
              {transcript.length.toLocaleString()} characters {transcript && "✓"}
            </div>

            {error && (
              <div style={{
                background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.2)",
                borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: T.danger,
              }}>{error}</div>
            )}

            {isLimited && (
              <div style={{
                background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)",
                borderRadius: 10, padding: "14px 18px", marginBottom: 16,
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                animation: "fadeUp 0.3s ease-out",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 3, fontFamily: "'Outfit', sans-serif" }}>
                    Free limit reached
                  </div>
                  <div style={{ fontSize: 12, color: T.textDim, fontFamily: "'Outfit', sans-serif" }}>
                    You've used all {FREE_LIMIT} free analyses. Upgrade for unlimited clips.
                  </div>
                </div>
                <button className="btn-primary" onClick={() => setShowPricing(true)} style={{ flexShrink: 0, padding: "8px 18px", fontSize: 13 }}>
                  See Plans →
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button className="btn-secondary" onClick={() => setStep(0)}>← Back</button>
              <button className="btn-primary" onClick={analyzeTranscript} disabled={!transcript.trim() || isLimited}>
                {isLimited ? "🔒 Limit Reached" : "🔍 Analyze with AI"}
              </button>
              {plan === "free" && !isLimited && (
                <span style={{ fontSize: 11, color: T.textDim, fontFamily: "'Outfit', sans-serif" }}>
                  {FREE_LIMIT - usageCount} free {FREE_LIMIT - usageCount === 1 ? "analysis" : "analyses"} left
                </span>
              )}
            </div>
          </div>
        )}

        {/* ===== STEP 2: LOADING ===== */}
        {step === 2 && loading && (
          <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeIn 0.4s ease-out" }}>
            <div style={{
              width: 52, height: 52,
              border: `3px solid rgba(46,46,64,0.5)`,
              borderTopColor: T.accent, borderRadius: "50%",
              margin: "0 auto 24px", animation: "spin 0.9s linear infinite",
              boxShadow: `0 0 30px rgba(0,229,160,0.2)`,
            }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.3px" }}>
              Analyzing transcript...
            </h3>
            <p style={{ color: T.textDim, fontSize: 14, lineHeight: 1.5 }}>
              AI is identifying the most clip-worthy moments
            </p>
          </div>
        )}

        {/* ===== STEP 3: RESULTS ===== */}
        {step === 3 && (
          <div style={{ animation: "fadeUp 0.5s ease-out" }}>

            {/* Clip Preview Player */}
            <TiltCard style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>🎬</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>Clip Preview</h3>
                <span style={{
                  fontSize: 11, color: T.textDim, background: "rgba(160,160,255,0.06)",
                  padding: "3px 8px", borderRadius: 5, fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {selectedClips.length} clip{selectedClips.length !== 1 ? "s" : ""} · {formatTime(totalClipDuration)}
                </span>
              </div>

              {/* Video player */}
              <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "16/9", marginBottom: 16, background: "rgba(17,17,24,0.8)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)", position: "relative" }}>
                {videoSource === "youtube" && youtubeId ? (
                  <iframe
                    ref={previewRef}
                    id="ytPreviewPlayer"
                    width="100%" height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                    frameBorder="0" allowFullScreen
                    allow="autoplay"
                    style={{ borderRadius: 12 }}
                  />
                ) : videoUrl ? (
                  <video ref={previewRef} src={videoUrl} style={{ width: "100%", height: "100%", borderRadius: 12 }} controls />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: T.textDim, fontSize: 14 }}>
                    No video source available
                  </div>
                )}

                {/* Active clip overlay label */}
                {activeClipIdx >= 0 && activeClipIdx < selectedClips.length && (
                  <div style={{
                    position: "absolute", top: 12, left: 12,
                    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
                    padding: "6px 12px", borderRadius: 8,
                    display: "flex", alignItems: "center", gap: 6,
                    animation: "fadeIn 0.2s ease-out",
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: isPlaying ? "#00E5A0" : "#6E6E85",
                      boxShadow: isPlaying ? "0 0 8px rgba(0,229,160,0.5)" : "none",
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>
                      Clip {activeClipIdx + 1}/{selectedClips.length}
                    </span>
                    <span style={{ fontSize: 11, color: T.textDim }}>
                      {formatTime(selectedClips[activeClipIdx].start)} → {formatTime(selectedClips[activeClipIdx].end)}
                    </span>
                  </div>
                )}
              </div>

              {/* Clip selector buttons */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {selectedClips.map((clip, i) => {
                  const cat = CATEGORIES[clip.category] || CATEGORIES.key_insight;
                  const isActive = activeClipIdx === i;
                  return (
                    <button key={i} onClick={() => {
                      setActiveClipIdx(i);
                      setIsPlaying(true);
                      if (videoSource === "youtube" && previewRef.current) {
                        previewRef.current.contentWindow?.postMessage(JSON.stringify({
                          event: "command", func: "seekTo", args: [clip.start, true]
                        }), "*");
                        previewRef.current.contentWindow?.postMessage(JSON.stringify({
                          event: "command", func: "playVideo"
                        }), "*");
                      } else if (previewRef.current && previewRef.current.tagName === "VIDEO") {
                        previewRef.current.currentTime = clip.start;
                        previewRef.current.play();
                      }
                    }} style={{
                      padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                      border: `1.5px solid ${isActive ? cat.color + "80" : "rgba(160,160,255,0.1)"}`,
                      background: isActive ? cat.color + "18" : "rgba(26,26,36,0.6)",
                      display: "flex", alignItems: "center", gap: 8,
                      transition: "all 0.2s ease",
                      fontFamily: "'Outfit', sans-serif",
                    }}>
                      <span style={{ fontSize: 12 }}>{cat.icon}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: isActive ? cat.color : T.textMid,
                      }}>Clip {i + 1}</span>
                      <span style={{
                        fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                        color: isActive ? T.text : T.textDim,
                      }}>{formatTime(clip.start)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Play all button */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => {
                  if (selectedClips.length === 0) return;
                  setActiveClipIdx(0);
                  setIsPlaying(true);
                  const clip = selectedClips[0];
                  if (videoSource === "youtube" && previewRef.current) {
                    previewRef.current.contentWindow?.postMessage(JSON.stringify({
                      event: "command", func: "seekTo", args: [clip.start, true]
                    }), "*");
                    previewRef.current.contentWindow?.postMessage(JSON.stringify({
                      event: "command", func: "playVideo"
                    }), "*");
                  } else if (previewRef.current && previewRef.current.tagName === "VIDEO") {
                    previewRef.current.currentTime = clip.start;
                    previewRef.current.play();
                  }
                }} disabled={selectedClips.length === 0}>
                  ▶ Play All Clips
                </button>
                <span style={{ fontSize: 12, color: T.textDim }}>
                  Click a clip to preview it, or play all in sequence
                </span>
              </div>
            </TiltCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.5px" }}>
                  <span style={{ color: T.accent }}>{clips.length}</span> clips found
                </h2>
                <p style={{ color: T.textMid, fontSize: 14 }}>
                  {selectedClips.length} selected · <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatTime(totalClipDuration)}</span> total
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={addManualClip}>+ Add Clip</button>
                <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setStep(1)}>↻ Re-analyze</button>
              </div>
            </div>

            <Timeline clips={clips} totalDuration={estimatedDuration} />

            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              {Object.entries(CATEGORIES).map(([key, cat]) => {
                const count = clips.filter((c) => c.category === key && c.selected).length;
                if (count === 0) return null;
                return (
                  <span key={key} style={{
                    fontSize: 11, color: cat.color, background: cat.color + "10",
                    padding: "4px 11px", borderRadius: 20, fontWeight: 600,
                    border: `1px solid ${cat.color}18`, fontFamily: F,
                  }}>{cat.icon} {cat.label} × {count}</span>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {clips.map((clip, i) => (
                <ClipCard key={i} clip={clip} index={i} onToggle={toggleClip}
                  onRemove={removeClip} onAdjust={adjustClip} totalDuration={estimatedDuration} />
              ))}
            </div>

            {/* Export */}
            <TiltCard style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>📤</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>Export</h3>
              </div>
              <p style={{ fontSize: 12, color: T.textDim, marginBottom: 20 }}>
                {selectedClips.length} clip{selectedClips.length !== 1 ? "s" : ""} selected · {formatTime(totalClipDuration)} total
              </p>

              {/* ===== PRIMARY: MP4 Video Compilation ===== */}
              <div style={{
                background: "rgba(0,229,160,0.04)", border: "1.5px solid rgba(0,229,160,0.15)",
                borderRadius: 14, padding: 20, marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                  <span style={{ fontSize: 22 }}>🎬</span>
                  <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>MP4 Video</h4>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.8px",
                    background: "linear-gradient(135deg, #00E5A0, #00C488)", color: "#111118",
                    padding: "2px 8px", borderRadius: 4,
                  }}>RECOMMENDED</span>
                  {videoSource === "youtube" && (
                    <span style={{
                      fontSize: 10, color: "#E0976A", background: "rgba(255,180,100,0.08)",
                      padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(255,180,100,0.1)",
                      fontWeight: 600,
                    }}>Upload only</span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: T.textDim, marginBottom: 16 }}>
                  Compile selected clips into a single downloadable video with transitions
                </p>

                {videoSource === "youtube" ? (
                  <div style={{
                    background: "rgba(255,180,100,0.05)", border: "1px solid rgba(255,180,100,0.12)",
                    borderRadius: 10, padding: 16,
                  }}>
                    <p style={{ fontSize: 13, color: "#E0976A", marginBottom: 8, fontWeight: 500 }}>
                      ⚠️ Browser compilation isn't available for YouTube videos due to download restrictions.
                    </p>
                    <p style={{ fontSize: 12, color: T.textDim, marginBottom: 12, lineHeight: 1.5 }}>
                      Download the video first using{" "}
                      <a href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noreferrer" style={{ color: T.accent, textDecoration: "none", borderBottom: `1px solid ${T.accent}40` }}>yt-dlp</a>,
                      then re-upload it here to compile. Or use the terminal commands below.
                    </p>
                    <pre style={{
                      background: "rgba(17,17,24,0.8)", border: "1px solid rgba(160,160,255,0.06)",
                      borderRadius: 8, padding: 12, fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                      color: T.accent, whiteSpace: "pre-wrap", lineHeight: 1.8,
                    }}>
                      {`# Download the video first:\nyt-dlp -f mp4 "${youtubeUrl}" -o input.mp4\n\n# Then compile all clips into one video:\n${selectedClips.map((c, i) => `ffmpeg -i input.mp4 -ss ${c.start} -to ${c.end} -c copy clip_${String(i + 1).padStart(2, "0")}.mp4`).join("\n")}\n\n# Merge into compilation:\nffmpeg -f concat -safe 0 -i <(printf "file '%s'\\n" clip_*.mp4) -c copy compilation.mp4`}
                    </pre>
                    <button className="btn-ghost" onClick={() => {
                      const cmd = `yt-dlp -f mp4 "${youtubeUrl}" -o input.mp4\n\n${selectedClips.map((c, i) => `ffmpeg -i input.mp4 -ss ${c.start} -to ${c.end} -c copy clip_${String(i + 1).padStart(2, "0")}.mp4`).join("\n")}\n\nffmpeg -f concat -safe 0 -i <(printf "file '%s'\\n" clip_*.mp4) -c copy compilation.mp4`;
                      navigator.clipboard?.writeText(cmd);
                    }} style={{ marginTop: 8 }}>
                      Copy full command
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Transition picker */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Transition Style</span>
                        <span style={{ fontSize: 11, color: T.textDim }}>
                          {transition !== "none" ? "Adds ~0.5s between clips" : "Instant switch"}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                        {Object.entries(TRANSITIONS).map(([key, t]) => {
                          const isActive = transition === key;
                          return (
                            <button key={key} onClick={() => { setTransition(key); setCompiledUrl(null); }} style={{
                              padding: "10px 6px", borderRadius: 10, cursor: "pointer",
                              border: `1.5px solid ${isActive ? "rgba(0,229,160,0.5)" : "rgba(160,160,255,0.08)"}`,
                              background: isActive ? "rgba(0,229,160,0.1)" : "rgba(26,26,36,0.5)",
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                              transition: "all 0.2s ease", fontFamily: "'Outfit', sans-serif",
                            }}>
                              <span style={{ fontSize: 18 }}>{t.icon}</span>
                              <span style={{
                                fontSize: 10, fontWeight: 600, letterSpacing: "-0.2px",
                                color: isActive ? "#00E5A0" : T.textMid,
                              }}>{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p style={{ fontSize: 11, color: T.textDim, marginTop: 6 }}>
                        {TRANSITIONS[transition]?.desc}
                        {transition !== "none" && " · Requires re-encoding (slower but looks pro)"}
                      </p>
                    </div>

                    {/* Aspect Ratio picker */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Aspect Ratio</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                        {Object.entries(ASPECT_RATIOS).map(([key, ar]) => {
                          const isActive = aspectRatio === key;
                          const previewW = key === "9:16" ? 28 : key === "1:1" ? 38 : 52;
                          const previewH = key === "9:16" ? 50 : key === "1:1" ? 38 : 30;
                          return (
                            <button key={key} onClick={() => { setAspectRatio(key); setCompiledUrl(null); }} style={{
                              padding: "12px 8px", borderRadius: 10, cursor: "pointer",
                              border: `1.5px solid ${isActive ? "rgba(0,229,160,0.5)" : "rgba(160,160,255,0.08)"}`,
                              background: isActive ? "rgba(0,229,160,0.1)" : "rgba(26,26,36,0.5)",
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                              transition: "all 0.2s ease", fontFamily: "'Outfit', sans-serif",
                            }}>
                              <div style={{
                                width: previewW, height: previewH, borderRadius: 4,
                                border: `2px solid ${isActive ? "#00E5A0" : T.textDim}`,
                                transition: "all 0.2s ease",
                              }} />
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#00E5A0" : T.text }}>{ar.label}</div>
                                <div style={{ fontSize: 9, color: T.textDim }}>{ar.desc}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Captions toggle + style picker */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Captions</span>
                        <button onClick={() => { setCaptionsEnabled(!captionsEnabled); setCompiledUrl(null); }} style={{
                          width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                          background: captionsEnabled ? "#00E5A0" : "rgba(160,160,255,0.15)",
                          border: "none", position: "relative", transition: "background 0.3s ease",
                          flexShrink: 0,
                        }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: "50%", background: "white",
                            position: "absolute", top: 3,
                            left: captionsEnabled ? 23 : 3,
                            transition: "left 0.3s ease",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                          }} />
                        </button>
                        <span style={{ fontSize: 11, color: T.textDim }}>
                          {captionsEnabled ? "Burn captions onto video" : "No captions"}
                        </span>
                      </div>

                      {captionsEnabled && (
                        <div style={{ animation: "fadeUp 0.3s ease-out" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                            {Object.entries(CAPTION_STYLES).map(([key, s]) => {
                              const isActive = captionStyle === key;
                              return (
                                <button key={key} onClick={() => { setCaptionStyle(key); setCompiledUrl(null); }} style={{
                                  padding: "10px 6px", borderRadius: 10, cursor: "pointer",
                                  border: `1.5px solid ${isActive ? "rgba(140,120,255,0.5)" : "rgba(160,160,255,0.08)"}`,
                                  background: isActive ? "rgba(140,120,255,0.1)" : "rgba(26,26,36,0.5)",
                                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                                  transition: "all 0.2s ease", fontFamily: "'Outfit', sans-serif",
                                }}>
                                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                                  <span style={{
                                    fontSize: 10, fontWeight: 600,
                                    color: isActive ? T.accentAlt : T.textMid,
                                  }}>{s.label}</span>
                                </button>
                              );
                            })}
                          </div>
                          <p style={{ fontSize: 11, color: T.textDim, marginTop: 6 }}>
                            {CAPTION_STYLES[captionStyle]?.desc} · Uses each clip's key quote
                          </p>
                        </div>
                      )}
                    </div>
                    {!compiledUrl && (
                      <button
                        className="btn-primary"
                        onClick={compileVideo}
                        disabled={compiling || selectedClips.length === 0}
                        style={{ fontSize: 15, padding: "14px 28px", width: "100%" }}
                      >
                        {compiling ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                            <span style={{
                              width: 14, height: 14, border: "2px solid rgba(0,229,160,0.3)",
                              borderTopColor: "#00E5A0", borderRadius: "50%",
                              animation: "spin 0.9s linear infinite", flexShrink: 0,
                            }} />
                            {compileProgress}
                          </span>
                        ) : (
                          <>{TRANSITIONS[transition]?.icon} Export {aspectRatio === "9:16" ? "Vertical" : aspectRatio === "1:1" ? "Square" : ""} MP4 {transition !== "none" ? `· ${TRANSITIONS[transition]?.label}` : "· Hard Cut"}{captionsEnabled ? " · Captions" : ""}</>
                        )}
                      </button>
                    )}

                    {/* Progress bar */}
                    {compiling && (
                      <div style={{
                        marginTop: 12, background: "rgba(26,26,36,0.6)",
                        borderRadius: 8, overflow: "hidden", height: 4,
                      }}>
                        <div style={{
                          height: "100%", background: `linear-gradient(90deg, ${T.accent}, ${T.accentAlt})`,
                          borderRadius: 8, width: "100%",
                          animation: "shimmer 1.5s ease-in-out infinite",
                          backgroundSize: "200% 100%",
                          backgroundImage: `linear-gradient(90deg, ${T.accent}40, ${T.accent}, ${T.accent}40)`,
                        }} />
                      </div>
                    )}

                    {/* Result: compiled video */}
                    {compiledUrl && (
                      <div style={{ animation: "fadeUp 0.4s ease-out" }}>
                        <div style={{
                          background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.15)",
                          borderRadius: 12, padding: 16, marginBottom: 14,
                          display: "flex", alignItems: "center", gap: 10,
                        }}>
                          <span style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: "rgba(0,229,160,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 14,
                          }}>✓</span>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: T.accent }}>Compilation ready!</span>
                            <span style={{ fontSize: 12, color: T.textDim, marginLeft: 8 }}>
                              {selectedClips.length} clips · {formatTime(totalClipDuration)}
                            </span>
                          </div>
                        </div>

                        <video
                          src={compiledUrl}
                          controls
                          style={{
                            width: "100%", borderRadius: 12, marginBottom: 14,
                            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                            border: "1px solid rgba(0,229,160,0.15)",
                          }}
                        />

                        <div style={{ display: "flex", gap: 10 }}>
                          <a href={compiledUrl} download="clipforge-compilation.mp4"
                            className="btn-primary" style={{ textDecoration: "none", fontSize: 15, padding: "14px 28px", flex: 1, justifyContent: "center" }}>
                            ⬇ Download MP4
                          </a>
                          <button className="btn-secondary" onClick={() => {
                            setCompiledUrl(null);
                            setCompileProgress("");
                          }} style={{ fontSize: 13 }}>
                            ↻ Re-compile
                          </button>
                        </div>
                      </div>
                    )}

                    {!compiling && !compiledUrl && (
                      <p style={{ fontSize: 11, color: T.textDim, marginTop: 10 }}>
                        ⚡ First compile loads the video processor (~30s). {transition !== "none" ? "Transitions require re-encoding which takes longer but produces pro results." : "Hard cut mode is fastest."}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ===== SECONDARY: Other Export Formats ===== */}
              <div style={{
                borderTop: "1px solid rgba(160,160,255,0.08)",
                paddingTop: 18,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 14 }}>📎</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.textMid }}>Also export as...</span>
                </div>

                {/* Format grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 14 }}>
                  {EXPORT_FORMATS.map((fmt) => (
                    <button key={fmt.id} className="btn-secondary" onClick={fmt.fn}
                      disabled={selectedClips.length === 0}
                      style={{
                        padding: "10px 6px", fontSize: 12, flexDirection: "column", gap: 3,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                      <span style={{ fontSize: 16 }}>{fmt.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 10 }}>{fmt.label}</span>
                      <span style={{ fontSize: 9, color: T.textDim, textAlign: "center", lineHeight: 1.2 }}>{fmt.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Quick actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-secondary" onClick={() => {
                    const t = selectedClips.map((c, i) => `Clip ${i + 1}: ${formatTime(c.start)} → ${formatTime(c.end)} | ${CATEGORIES[c.category]?.label || c.category} | ${c.reason}`).join("\n");
                    navigator.clipboard?.writeText(t);
                  }} disabled={selectedClips.length === 0} style={{ fontSize: 12 }}>
                    📋 Copy to Clipboard
                  </button>
                  <button className="btn-secondary" onClick={() => setShowFFmpeg(!showFFmpeg)} disabled={selectedClips.length === 0} style={{ fontSize: 12 }}>
                    ⌨️ {showFFmpeg ? "Hide" : "Show"} FFmpeg Commands
                  </button>
                </div>
                {showFFmpeg && (
                  <div style={{ animation: "fadeUp 0.3s ease-out", marginTop: 12 }}>
                    <pre style={{
                      background: "rgba(17,17,24,0.8)", border: "1px solid rgba(160,160,255,0.06)",
                      borderRadius: 10, padding: 16, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                      color: T.accent, overflowX: "auto", lineHeight: 1.9, whiteSpace: "pre-wrap",
                    }}>
                      {generateFFmpegCommands()}
                      {"\n\n# Concatenate all clips:\n"}
                      {`ffmpeg -f concat -safe 0 -i <(printf "file '%s'\\n" clip_*.mp4) -c copy final_compilation.mp4`}
                    </pre>
                    <button className="btn-ghost" onClick={() => navigator.clipboard?.writeText(generateFFmpegCommands())} style={{ marginTop: 8 }}>
                      Copy commands
                    </button>
                  </div>
                )}
              </div>
            </TiltCard>
          </div>
        )}
      </div>
    </div>
  );
}
