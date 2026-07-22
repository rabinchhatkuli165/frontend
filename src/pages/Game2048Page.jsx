import { useCallback, useEffect, useState } from "react";
import GameShell from "../components/cyber/GameShell";
import CyberPageHeader from "../components/cyber/CyberPageHeader";
import CyberPanel from "../components/cyber/CyberPanel";
import CyberButton from "../components/cyber/CyberButton";
import CyberStat, { CyberStatGrid } from "../components/cyber/CyberStat";
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

  const maxVal = maxTile(grid);

  return (
    <GameShell accent="amber" maxWidth="md">
      <CyberPageHeader
        title="2048"
        subtitle="Arrow keys: merge matching numbers. Reach 2048 or fill the board with no moves."
        tag="ARCADE"
      />

      {isGuest && <SignupPrompt variant="cyber" />}

      <CyberPanel>
        <CyberStatGrid>
          <CyberStat label="Score" value={score} highlight delay={0} />
          <CyberStat label="Best tile" value={maxVal || "—"} delay={50} />
        </CyberStatGrid>

        <div className="cyber-toolbar">
          <p className="cyber-toolbar-status">
            {over ? "No moves left." : "Use arrow keys to slide tiles."}
          </p>
          <CyberButton variant="primary" onClick={restart}>
            New game
          </CyberButton>
        </div>

        <div className="cyber-2048-board">
          {grid.flat().map((v, i) => (
            <div
              key={i}
              className={`cyber-2048-tile${v === 0 ? " is-empty" : ""}`}
              data-value={v || undefined}
            >
              {v || ""}
            </div>
          ))}
        </div>

        {over && <p className="cyber-msg cyber-msg--error">Game over — no moves left.</p>}
        <p className="cyber-hint">Use keyboard arrows (↑ ↓ ← →)</p>
      </CyberPanel>
    </GameShell>
  );
}
