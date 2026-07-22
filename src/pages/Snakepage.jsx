import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
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

export default function SnakePage() {
  const [snake, setSnake] = useState(START_SNAKE);
  const [food, setFood] = useState(() => randomEmptyCell(START_SNAKE));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | playing | paused | over
  const { saveStats, isGuest } = useGuestSave();

  const dirRef = useRef(START_DIR);
  const nextDirRef = useRef(START_DIR);
  const snakeRef = useRef(START_SNAKE);
  const foodRef = useRef(food);
  const speedRef = useRef(BASE_SPEED_MS);
  const lastTickRef = useRef(0);
  const rafRef = useRef(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  const endGame = useCallback(
    (finalScore) => {
      setPhase("over");
      setBest((prev) => Math.max(prev, finalScore));
      const progress = Math.min(100, Math.round((finalScore / PROGRESS_TARGET_SCORE) * 100));
      saveStats({ game: "snake", highScore: finalScore, progress });
    },
    [saveStats]
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
      setFood(randomEmptyCell(nextSnake));
      speedRef.current = Math.max(MIN_SPEED_MS, speedRef.current - SPEED_STEP_MS);
    }
    setSnake(nextSnake);
  }, [endGame, score]);

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
    setPhase("playing");
  }, []);

  const togglePause = useCallback(() => {
    setPhase((p) => {
      if (p === "playing") return "paused";
      if (p === "paused") return "playing";
      return p;
    });
  }, []);

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

  const snakeSet = useMemo(() => new Set(snake.map((seg) => `${seg.x},${seg.y}`)), [snake]);
  const headKey = snake.length ? `${snake[0].x},${snake[0].y}` : null;

  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <PageHeader
          title="Snake"
          subtitle="Eat food to grow and score points. Hitting a wall or your own tail ends the run."
        />

        {isGuest && <SignupPrompt />}

        <div className="card-elevated p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Score</p>
              <p className="text-lg font-bold text-slate-900">{score}</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3">
              <p className="text-xs text-indigo-600 uppercase tracking-wide">Best (session)</p>
              <p className="text-lg font-bold text-indigo-700">{best}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs text-emerald-600 uppercase tracking-wide">Length</p>
              <p className="text-lg font-bold text-emerald-700">{snake.length}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-xs text-amber-600 uppercase tracking-wide">Speed</p>
              <p className="text-lg font-bold text-amber-700">
                {Math.round(((BASE_SPEED_MS - speedRef.current) / (BASE_SPEED_MS - MIN_SPEED_MS)) * 100) || 0}%
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
            <p className="text-slate-600 text-sm">
              {phase === "over" && <span className="text-rose-700 font-semibold">Game over.</span>}
              {phase === "paused" && <span className="text-amber-700 font-semibold">Paused.</span>}
              {phase === "playing" && <span>20×20 board · arrows or WASD</span>}
              {phase === "idle" && <span>Press Play to begin.</span>}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={togglePause}
                disabled={phase === "idle" || phase === "over"}
                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                {phase === "paused" ? "Resume" : "Pause"}
              </button>
              <button
                type="button"
                onClick={startGame}
                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold"
              >
                Restart
              </button>
            </div>
          </div>

          <div className="relative mx-auto" style={{ maxWidth: 480 }}>
            <div
              className="grid gap-px bg-slate-800 p-2 rounded-2xl select-none"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: ROWS * COLS }, (_, i) => {
                const x = i % COLS;
                const y = Math.floor(i / COLS);
                const key = `${x},${y}`;
                const isHead = key === headKey;
                const isBody = !isHead && snakeSet.has(key);
                const isFood = food.x === x && food.y === y;
                return (
                  <div
                    key={key}
                    className={`aspect-square rounded-sm ${
                      isHead
                        ? "bg-emerald-400"
                        : isBody
                          ? "bg-emerald-600"
                          : isFood
                            ? "bg-rose-400"
                            : "bg-slate-700/60"
                    }`}
                  />
                );
              })}
            </div>

            {phase !== "playing" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/80 backdrop-blur-sm">
                <div className="text-center px-6">
                  {phase === "idle" && (
                    <>
                      <p className="text-white text-lg font-semibold mb-4">Ready to slither?</p>
                      <button type="button" className="btn-primary !w-auto px-8" onClick={startGame}>
                        Play
                      </button>
                    </>
                  )}
                  {phase === "paused" && (
                    <>
                      <p className="text-white text-lg font-semibold mb-4">Paused</p>
                      <button type="button" className="btn-primary !w-auto px-8" onClick={togglePause}>
                        Resume
                      </button>
                    </>
                  )}
                  {phase === "over" && (
                    <>
                      <p className="text-rose-300 text-lg font-semibold mb-1">Game over</p>
                      <p className="text-white/80 text-sm mb-4">
                        Score: {score} {score >= best && score > 0 ? "— new best!" : ""}
                      </p>
                      <button type="button" className="btn-primary !w-auto px-8" onClick={startGame}>
                        Play again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 w-40 mx-auto sm:hidden">
            <div />
            <button
              type="button"
              className="btn-secondary !px-0 py-2"
              onClick={() => queueDirection({ x: 0, y: -1 })}
              aria-label="Move up"
            >
              ↑
            </button>
            <div />
            <button
              type="button"
              className="btn-secondary !px-0 py-2"
              onClick={() => queueDirection({ x: -1, y: 0 })}
              aria-label="Move left"
            >
              ←
            </button>
            <button
              type="button"
              className="btn-secondary !px-0 py-2"
              onClick={() => queueDirection({ x: 0, y: 1 })}
              aria-label="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              className="btn-secondary !px-0 py-2"
              onClick={() => queueDirection({ x: 1, y: 0 })}
              aria-label="Move right"
            >
              →
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500 text-center">
            Arrows/WASD to move · Space or P to pause · on-screen pad on small screens.
          </p>
        </div>
      </main>
    </div>
  );
}