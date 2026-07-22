import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import SignupPrompt from "../components/SignupPrompt";
import { useAuth } from "../context/AuthContext";
import useSound from "../hooks/useSound";
import "../styles/DashboardPage.css";

const games = [
  { key: "memory-match", title: "Memory Match", description: "Flip cards and match pairs — fewer moves, higher score.", icon: "🃏", accent: "violet", tag: "PUZZLE" },
  { key: "sudoku", title: "Sudoku", description: "Fill the grid with logic; mistakes cost your final score.", icon: "9️⃣", accent: "blue", tag: "LOGIC" },
  { key: "word-search", title: "Word Search", description: "Spot every word hidden in the letter grid.", icon: "🔤", accent: "teal", tag: "WORD" },
  { key: "2048", title: "2048", description: "Slide and merge tiles on a 4×4 board.", icon: "🔢", accent: "amber", tag: "ARCADE" },
  { key: "minesweeper", title: "Minesweeper", description: "Avoid hidden mines and clear every safe tile.", icon: "💣", accent: "slate", tag: "STRATEGY" },
  { key: "reaction", title: "Reaction Time", description: "Test your reflexes by clicking instantly.", icon: "⚡", accent: "lime", tag: "REFLEX" },
  { key: "snake", title: "Snake", description: "Eat food, grow longer and survive.", icon: "🐍", accent: "green", tag: "CLASSIC" },
];

function NeuralField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let nodes = [];
    let w, h;
    const LINK_DIST = 140;

    const palette = ["#a78bfa", "#22d3ee", "#f472b6", "#34d399", "#fbbf24"];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(70, Math.floor((w * h) / 22000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      color: palette[Math.floor(Math.random() * palette.length)],
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.025;
        if (n.x < 0) n.x = w;
        if (n.x > w) n.x = 0;
        if (n.y < 0) n.y = h;
        if (n.y > h) n.y = 0;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = nodes[i].color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        const alpha = 0.5 + Math.sin(n.pulse) * 0.35;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = alpha * 0.15;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden />;
}

function DataStream() {
  const items = [...games.map((g) => g.title), "GAMEHUB", "NEURAL LINK", "ONLINE"];
  const doubled = [...items, ...items];

  return (
    <div className="data-stream" aria-hidden>
      <div className="data-stream-track">
        {doubled.map((label, i) => (
          <span key={i} className="data-stream-item">
            {label}
            <span className="data-stream-dot">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Night ops";
}

function HudCorners({ className = "" }) {
  return (
    <div className={`hud-corners ${className}`} aria-hidden>
      <span className="hud-corner hud-tl" />
      <span className="hud-corner hud-tr" />
      <span className="hud-corner hud-bl" />
      <span className="hud-corner hud-br" />
    </div>
  );
}

function LiveStat({ label, value, delay = 0 }) {
  return (
    <div className="live-stat" style={{ "--stat-delay": `${delay}ms` }}>
      <span className="live-stat-value">{value}</span>
      <span className="live-stat-label">{label}</span>
      <span className="live-stat-pulse" />
    </div>
  );
}

function GameCard({ game, index, sound, featured = false }) {
  const cardRef = useRef(null);

  const handleMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -12;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    el.style.setProperty("--rx", `${rotateX}deg`);
    el.style.setProperty("--ry", `${rotateY}deg`);
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  }, []);

  const handleLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  return (
    <Link
      ref={cardRef}
      to={`/games/${game.key}`}
      className={`dash-game-card accent-${game.accent}${featured ? " is-featured" : ""}`}
      style={{ "--delay": `${index * 80 + 200}ms` }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={() => sound.hover()}
      onClick={() => sound.click()}
    >
      <div className="dash-card-border" />
      <div className="dash-card-sheen" />
      <div className="dash-card-scan" />
      <HudCorners className="dash-card-hud" />

      <span className="dash-card-tag">{game.tag}</span>

      <div className="dash-card-icon">
        <span className="dash-card-icon-inner">{game.icon}</span>
        <span className="dash-card-icon-ring" />
      </div>

      <h2 className="dash-card-title">{game.title}</h2>
      <p className="dash-card-desc">{game.description}</p>

      <div className="dash-play-btn">
        <span className="dash-play-text">INITIALIZE</span>
        <span className="dash-play-arrow">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <span className="dash-card-index">{String(index + 1).padStart(2, "0")}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const sound = useSound();
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.pause();
      setMusicOn(false);
    } else {
      audioRef.current.volume = 0.25;
      audioRef.current.play().catch(() => {});
      setMusicOn(true);
    }
    sound.click();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 300);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-shell">
      <NeuralField />
      <div className="dash-aurora dash-aurora-1" />
      <div className="dash-aurora dash-aurora-2" />
      <div className="dash-aurora dash-aurora-3" />
      <div className="dash-hex-grid" />
      <div className="dash-noise" />
      <div className="dash-vignette" />
      <div className="dash-scanlines" />

      <audio ref={audioRef} src="/sounds/arcade-loop.mp3" loop style={{ display: "none" }} />

      <Navbar />

      <DataStream />

      <main className="dashboard-container">
        <button
          type="button"
          className={`dash-music-toggle ${musicOn ? "is-on" : ""}`}
          onClick={toggleMusic}
          onMouseEnter={() => sound.hover()}
        >
          <span className="dash-music-icon">{musicOn ? "◉" : "○"}</span>
          <span className="dash-music-label">{musicOn ? "AUDIO LINK" : "AUDIO OFF"}</span>
          <span className="dash-music-bars" aria-hidden>
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className="dash-music-bar" style={{ "--i": n }} />
            ))}
          </span>
        </button>

        <section className="dash-hero">
          <HudCorners />

          <div className="dash-hero-badge">
            <span className="dash-hero-badge-dot" />
            {user ? `${getTimeGreeting()}, ${user.username}` : "SYSTEM ONLINE — GAMEHUB v2.0"}
          </div>

          <h1 className={`dash-hero-title ${glitchActive ? "is-glitching" : ""}`}>
            <span className="dash-hero-line">SELECT YOUR</span>
            <span className="dash-hero-glitch" data-text="MISSION PROTOCOL">
              MISSION PROTOCOL
            </span>
          </h1>

          <p className="dash-hero-sub">
            {user
              ? "Neural sync active — your scores and achievements persist across every mission."
              : "Guest mode engaged. Create an account to sync progress across the grid."}
          </p>

          {user && (
            <p className="dash-hero-welcome" aria-hidden>
              ◈ ◈ ◈
            </p>
          )}

          <div className="dash-stats-row">
            <LiveStat label="MODULES" value={games.length} delay={0} />
            <LiveStat label="STATUS" value="READY" delay={100} />
            <LiveStat label="LATENCY" value="<1ms" delay={200} />
          </div>
        </section>

        {!user && (
          <div className="dash-signup-wrap">
            <SignupPrompt variant="cyber" />
          </div>
        )}

        <div className="dash-section-header">
          <span className="dash-section-line" />
          <h2 className="dash-section-title">AVAILABLE MODULES</h2>
          <span className="dash-section-line" />
        </div>

        <section className="dash-games-grid">
          {games.map((game, i) => (
            <GameCard
              key={game.key}
              game={game}
              index={i}
              sound={sound}
              featured={i === 0}
            />
          ))}
        </section>

        <footer className="dash-footer">
          <span className="dash-footer-text">◈ NEURAL GAMEHUB ◈ ALL SYSTEMS NOMINAL ◈</span>
        </footer>
      </main>
    </div>
  );
}
