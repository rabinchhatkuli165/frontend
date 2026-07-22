import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import SignupPrompt from "../components/SignupPrompt";
import { useGuestSave } from "../hooks/useGuestSave";

const N = 4;

const empty = () => Array.from({ length: N }, () => Array(N).fill(0));

function addTile(g) {
  const cells = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g[r][c] === 0) cells.push([r, c]);
  if (!cells.length) return g;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  const next = g.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function mergeLine(line) {
  const a = line.filter((x) => x !== 0);
  const out = [];
  let scoreAdd = 0;
  for (let i = 0; i < a.length; i++) {
    if (i < a.length - 1 && a[i] === a[i + 1]) {
      const v = a[i] * 2;
      out.push(v);
      scoreAdd += v;
      i++;
    } else {
      out.push(a[i]);
    }
  }
  while (out.length < N) out.push(0);
  return { line: out, scoreAdd };
}

function same(a, b) {
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (a[r][c] !== b[r][c]) return false;
  return true;
}

function maxTile(g) {
  let m = 0;
  for (const row of g) for (const x of row) m = Math.max(m, x);
  return m;
}

function moveGrid(g, dir) {
  let next = g.map((row) => [...row]);
  let scoreAdd = 0;
  if (dir === "left") {
    for (let r = 0; r < N; r++) {
      const { line, scoreAdd: s } = mergeLine(next[r]);
      scoreAdd += s;
      next[r] = line;
    }
  } else if (dir === "right") {
    for (let r = 0; r < N; r++) {
      const { line, scoreAdd: s } = mergeLine([...next[r]].reverse());
      scoreAdd += s;
      next[r] = line.reverse();
    }
  } else if (dir === "up") {
    for (let c = 0; c < N; c++) {
      const col = [];
      for (let r = 0; r < N; r++) col.push(next[r][c]);
      const { line, scoreAdd: s } = mergeLine(col);
      scoreAdd += s;
      for (let r = 0; r < N; r++) next[r][c] = line[r];
    }
  } else if (dir === "down") {
    for (let c = 0; c < N; c++) {
      const col = [];
      for (let r = N - 1; r >= 0; r--) col.push(next[r][c]);
      const { line, scoreAdd: s } = mergeLine(col);
      scoreAdd += s;
      for (let r = 0; r < N; r++) next[N - 1 - r][c] = line[r];
    }
  }
  return { next, scoreAdd };
}

function canMove(g) {
  for (const d of ["left", "right", "up", "down"]) {
    const { next } = moveGrid(g, d);
    if (!same(g, next)) return true;
  }
  return false;
}

export default function Game2048Page() {
  const [grid, setGrid] = useState(() => addTile(addTile(empty())));
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const { saveStats, isGuest } = useGuestSave();

  useEffect(() => {
    if (!over) return;
    const max = maxTile(grid);
    saveStats({
      game: "game2048",
      highScore: score + max * 5,
      progress: max >= 2048 ? 100 : Math.min(99, Math.floor((Math.log2(Math.max(max, 2)) / 11) * 100))
    });
  }, [over, grid, score]); // eslint-disable-line react-hooks/exhaustive-deps

  const tryMove = useCallback(
    (dir) => {
      if (over) return;
      setGrid((g) => {
        const { next, scoreAdd } = moveGrid(g, dir);
        if (same(g, next)) return g;
        setScore((s) => s + scoreAdd);
        let after = addTile(next);
        if (!canMove(after)) setOver(true);
        return after;
      });
    },
    [over]
  );

  useEffect(() => {
    const onKey = (e) => {
      const m = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
      const d = m[e.key];
      if (!d) return;
      e.preventDefault();
      tryMove(d);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tryMove]);

  const restart = () => {
    setGrid(addTile(addTile(empty())));
    setScore(0);
    setOver(false);
  };

  const cellBg = (v) => {
    if (v === 0) return "bg-slate-200/90";
    if (v < 8) return "bg-amber-100 text-amber-900";
    if (v < 128) return "bg-orange-200 text-orange-950";
    return "bg-rose-400 text-white";
  };

  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <PageHeader
          title="2048"
          subtitle="Arrow keys: merge matching numbers. Reach 2048 or fill the board with no moves."
        />

        {isGuest && <SignupPrompt />}

        <div className="card-elevated p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-600">
              Score: <span className="font-bold text-slate-900">{score}</span>
            </p>
            <button type="button" onClick={restart} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
              New game
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 bg-slate-800 p-3 rounded-2xl">
            {grid.flat().map((v, i) => (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded-xl text-lg sm:text-2xl font-bold ${cellBg(v)}`}
              >
                {v || ""}
              </div>
            ))}
          </div>
          {over && <p className="mt-4 text-rose-700 font-semibold">Game over — no moves left.</p>}
          <p className="mt-4 text-xs text-slate-500">Use keyboard arrows (↑ ↓ ← →).</p>
        </div>
      </main>
    </div>
  );
}