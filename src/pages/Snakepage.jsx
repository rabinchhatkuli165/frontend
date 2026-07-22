import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameShell from "../components/cyber/GameShell";
import CyberPageHeader from "../components/cyber/CyberPageHeader";
import CyberPanel from "../components/cyber/CyberPanel";
import CyberButton from "../components/cyber/CyberButton";
import CyberStat, { CyberStatGrid } from "../components/cyber/CyberStat";
import SignupPrompt from "../components/SignupPrompt";
import { useGuestSave } from "../hooks/useGuestSave";

const COLS = 20;
const ROWS = 20;
const START_SNAKE = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 }
];
const START_DIR = { x: 1, y: 0 };
const BASE_SPEED_MS = 150;
const MIN_SPEED_MS = 60;
const SPEED_STEP_MS = 3;
const FOOD_SCORE = 10;
const PROGRESS_TARGET_SCORE = 500;
const PARTICLE_COUNT = 12;
const PARTICLE_LIFETIME_MS = 500;
const SHAKE_DURATION_MS = 420;
const POP_LIFETIME_MS = 700;

function randomEmptyCell(snake) {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  let cell;
  do {
    cell = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (occupied.has(`${cell.x},${cell.y}`));
  return cell;
}

function isOpposite(a, b) {
  return a.x === -b.x && a.y === -b.y;
}

let uidCounter = 0;
function nextId() {
  uidCounter += 1;
  return uidCounter;
}

// Tiny procedural sound engine (Web Audio API oscillators, no audio files needed).
function useArcadeSound() {
  const ctxRef = useRef(null);
  const mutedRef = useRef(false);
  const [muted, setMutedState] = useState(false);

  const setMuted = useCallback((value) => {
    mutedRef.current = value;
    setMutedState(value);
  }, []);

  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctxRef.current) {
      ctxRef.current = new AudioCtx();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    ({ freq, to, duration = 0.12, type = "square", volume = 0.14, delay = 0 }) => {
      if (mutedRef.current) return;
      const ctx = getCtx();
      if (!ctx) return;
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (to && to !== freq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), start + duration);
      }
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    },
    [getCtx]
  );

  const sounds = useMemo(
    () => ({
      eat: () => tone({ freq: 520, to: 900, duration: 0.09, type: "square", volume: 0.13 }),
      start: () => {
        tone({ freq: 300, to: 500, duration: 0.1, type: "triangle", volume: 0.12 });
        tone({ freq: 500, to: 700, duration: 0.12, type: "triangle", volume: 0.1, delay: 0.08 });
      },
      pause: () => tone({ freq: 340, to: 340, duration: 0.05, type: "sine", volume: 0.08 }),
      gameOver: () => {
        tone({ freq: 300, to: 160, duration: 0.22, type: "sawtooth", volume: 0.15 });
        tone({ freq: 220, to: 90, duration: 0.35, type: "sawtooth", volume: 0.13, delay: 0.12 });
      }
    }),
    [tone]
  );

  return { sounds, muted, setMuted };
}

export default function SnakePage() {
  const [snake, setSnake] = useState(START_SNAKE);
  const [food, setFood] = useState(() => randomEmptyCell(START_SNAKE));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | playing | paused | over
  const [particles, setParticles] = useState([]);
  const [pops, setPops] = useState([]);
  const [shaking, setShaking] = useState(false);
  const { saveStats, isGuest } = useGuestSave();
  const { sounds, muted, setMuted } = useArcadeSound();

  const dirRef = useRef(START_DIR);
  const nextDirRef = useRef(START_DIR);
  const snakeRef = useRef(START_SNAKE);
  const foodRef = useRef(food);
  const speedRef = useRef(BASE_SPEED_MS);
  const lastTickRef = useRef(0);
  const rafRef = useRef(null);
  const phaseRef = useRef(phase);
  const shakeTimeoutRef = useRef(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  const spawnBurst = useCallback((cell) => {
    const cx = ((cell.x + 0.5) / COLS) * 100;
    const cy = ((cell.y + 0.5) / ROWS) * 100;
    const burst = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 26 + Math.random() * 22;
      return {
        id: nextId(),
        cx,
        cy,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: 3 + Math.random() * 4
      };
    });
    setParticles((prev) => [...prev, ...burst]);
    const burstIds = burst.map((p) => p.id);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !burstIds.includes(p.id)));
    }, PARTICLE_LIFETIME_MS);

    const popId = nextId();
    setPops((prev) => [...prev, { id: popId, cx, cy }]);
    setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== popId));
    }, POP_LIFETIME_MS);
  }, []);

  const triggerShake = useCallback(() => {
    setShaking(true);
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    shakeTimeoutRef.current = setTimeout(() => setShaking(false), SHAKE_DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    },
    []
  );

  const endGame = useCallback(
    (finalScore) => {
      setPhase("over");
      setBest((prev) => Math.max(prev, finalScore));
      const progress = Math.min(100, Math.round((finalScore / PROGRESS_TARGET_SCORE) * 100));
      saveStats({ game: "snake", highScore: finalScore, progress });
      sounds.gameOver();
      triggerShake();
    },
    [saveStats, sounds, triggerShake]
  );

  const tick = useCallback(() => {
    dirRef.current = nextDirRef.current;
    const head = snakeRef.current[0];
    const newHead = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
      endGame(score);
      return;
    }

    const ateFood = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
    const bodyToCheck = ateFood ? snakeRef.current : snakeRef.current.slice(0, -1);
    if (bodyToCheck.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
      endGame(score);
      return;
    }

    const nextSnake = [newHead, ...snakeRef.current];
    if (!ateFood) {
      nextSnake.pop();
    } else {
      setScore((s) => s + FOOD_SCORE);
      spawnBurst(foodRef.current);
      setFood(randomEmptyCell(nextSnake));
      speedRef.current = Math.max(MIN_SPEED_MS, speedRef.current - SPEED_STEP_MS);
      sounds.eat();
    }
    setSnake(nextSnake);
  }, [endGame, score, sounds, spawnBurst]);

  const tickRef = useRef(tick);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    let active = true;
    lastTickRef.current = performance.now();

    const loop = (timestamp) => {
      if (!active) return;
      if (timestamp - lastTickRef.current >= speedRef.current) {
        lastTickRef.current = timestamp;
        tickRef.current();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  const startGame = useCallback(() => {
    dirRef.current = START_DIR;
    nextDirRef.current = START_DIR;
    snakeRef.current = START_SNAKE;
    speedRef.current = BASE_SPEED_MS;
    setSnake(START_SNAKE);
    setFood(randomEmptyCell(START_SNAKE));
    setScore(0);
    setParticles([]);
    setPops([]);
    setPhase("playing");
    sounds.start();
  }, [sounds]);

  const togglePause = useCallback(() => {
    setPhase((p) => {
      if (p === "playing") {
        sounds.pause();
        return "paused";
      }
      if (p === "paused") {
        sounds.pause();
        return "playing";
      }
      return p;
    });
  }, [sounds]);

  const queueDirection = useCallback((dir) => {
    if (phaseRef.current !== "playing") return;
    if (isOpposite(dir, dirRef.current) && snakeRef.current.length > 1) return;
    nextDirRef.current = dir;
  }, []);

  useEffect(() => {
    const dirMap = {
      ArrowUp: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      W: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      S: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      A: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      d: { x: 1, y: 0 },
      D: { x: 1, y: 0 }
    };

    const onKey = (e) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        togglePause();
        return;
      }
      if (e.key === "p" || e.key === "P") {
        togglePause();
        return;
      }
      const dir = dirMap[e.key];
      if (!dir) return;
      e.preventDefault();
      queueDirection(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePause, queueDirection]);

  const snakeIndex = useMemo(() => {
    const map = new Map();
    snake.forEach((seg, i) => map.set(`${seg.x},${seg.y}`, i));
    return map;
  }, [snake]);
  const headKey = snake.length ? `${snake[0].x},${snake[0].y}` : null;

  return (
    <GameShell accent="green" maxWidth="md">
      <CyberPageHeader
        title="Snake"
        subtitle="Eat food to grow and score points. Hitting a wall or your own tail ends the run."
        tag="CLASSIC"
      />

      {isGuest && <SignupPrompt variant="cyber" />}

      <CyberPanel>
        <CyberStatGrid>
          <CyberStat label="Score" value={score} highlight delay={0} />
          <CyberStat label="Best (session)" value={best} delay={50} />
          <CyberStat label="Length" value={snake.length} delay={100} />
          <CyberStat
            label="Speed"
            value={`${Math.round(((BASE_SPEED_MS - speedRef.current) / (BASE_SPEED_MS - MIN_SPEED_MS)) * 100) || 0}%`}
            delay={150}
          />
        </CyberStatGrid>

        <div className="cyber-toolbar">
          <p className="cyber-toolbar-status">
            {phase === "over" && <span className="cyber-msg--error">Game over.</span>}
            {phase === "paused" && <span className="cyber-msg--warn">Paused.</span>}
            {phase === "playing" && <span>20×20 board · arrows or WASD</span>}
            {phase === "idle" && <span>Press Play to begin.</span>}
          </p>
          <div className="cyber-toolbar-actions">
            <CyberButton variant="ghost" onClick={() => setMuted(!muted)} aria-label={muted ? "Unmute sound" : "Mute sound"} title={muted ? "Unmute sound" : "Mute sound"}>
              {muted ? "🔇" : "🔊"}
            </CyberButton>
            <CyberButton variant="ghost" onClick={togglePause} disabled={phase === "idle" || phase === "over"}>
              {phase === "paused" ? "Resume" : "Pause"}
            </CyberButton>
            <CyberButton variant="primary" onClick={startGame}>
              Restart
            </CyberButton>
          </div>
        </div>

        <div className="cyber-snake-board">
          <div
            className={`cyber-snake-grid${shaking ? " cyber-snake-shake" : ""}`}
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            <div className="cyber-snake-scanlines pointer-events-none" />
            {Array.from({ length: ROWS * COLS }, (_, i) => {
              const x = i % COLS;
              const y = Math.floor(i / COLS);
              const key = `${x},${y}`;
              const segIndex = snakeIndex.get(key);
              const isHead = key === headKey;
              const isBody = segIndex !== undefined && !isHead;
              const isFood = food.x === x && food.y === y;
              const decay = isBody ? Math.min(segIndex / Math.max(snake.length - 1, 1), 1) : 0;

              let cellClass = "cyber-snake-cell ";
              if (isHead) cellClass += "is-head";
              else if (isFood) cellClass += "is-food";
              else if (isBody) cellClass += "is-body";
              else cellClass += "is-empty";

              return (
                <div
                  key={key}
                  className={cellClass}
                  style={
                    isBody
                      ? {
                          backgroundColor: `rgba(52, 211, 153, ${0.95 - decay * 0.55})`,
                          boxShadow: `0 0 ${6 - decay * 4}px rgba(52, 211, 153, ${0.7 - decay * 0.5})`
                        }
                      : undefined
                  }
                />
              );
            })}

            {particles.map((p) => (
              <span
                key={p.id}
                className="cyber-snake-particle"
                style={{
                  left: `${p.cx}%`,
                  top: `${p.cy}%`,
                  width: p.size,
                  height: p.size,
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                  animation: `cyberSnakeBurst ${PARTICLE_LIFETIME_MS}ms ease-out forwards`
                }}
              />
            ))}

            {pops.map((p) => (
              <span
                key={p.id}
                className="cyber-snake-pop"
                style={{
                  left: `${p.cx}%`,
                  top: `${p.cy}%`,
                  animation: `cyberSnakeFloat ${POP_LIFETIME_MS}ms ease-out forwards`
                }}
              >
                +{FOOD_SCORE}
              </span>
            ))}
          </div>

          {phase !== "playing" && (
            <div className="cyber-snake-overlay">
              <div style={{ textAlign: "center", padding: "0 24px" }}>
                {phase === "idle" && (
                  <>
                    <p>Ready to slither?</p>
                    <CyberButton variant="primary" onClick={startGame}>
                      Play
                    </CyberButton>
                  </>
                )}
                {phase === "paused" && (
                  <>
                    <p>Paused</p>
                    <CyberButton variant="primary" onClick={togglePause}>
                      Resume
                    </CyberButton>
                  </>
                )}
                {phase === "over" && (
                  <>
                    <p className="cyber-msg--error">Game over</p>
                    <p style={{ marginBottom: 16, fontSize: "0.9rem", color: "rgba(232,232,240,0.6)" }}>
                      Score: {score} {score >= best && score > 0 ? "— new best!" : ""}
                    </p>
                    <CyberButton variant="primary" onClick={startGame}>
                      Play again
                    </CyberButton>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="cyber-dpad">
          <div />
          <CyberButton className="cyber-dpad-btn" variant="ghost" onClick={() => queueDirection({ x: 0, y: -1 })} aria-label="Move up">↑</CyberButton>
          <div />
          <CyberButton className="cyber-dpad-btn" variant="ghost" onClick={() => queueDirection({ x: -1, y: 0 })} aria-label="Move left">←</CyberButton>
          <CyberButton className="cyber-dpad-btn" variant="ghost" onClick={() => queueDirection({ x: 0, y: 1 })} aria-label="Move down">↓</CyberButton>
          <CyberButton className="cyber-dpad-btn" variant="ghost" onClick={() => queueDirection({ x: 1, y: 0 })} aria-label="Move right">→</CyberButton>
        </div>

        <p className="cyber-hint">
          Arrows/WASD to move · Space or P to pause · on-screen pad on small screens
        </p>
      </CyberPanel>
    </GameShell>
  );
}