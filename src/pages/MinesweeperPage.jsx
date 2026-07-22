import { useEffect, useMemo, useState } from "react";
import GameShell from "../components/cyber/GameShell";
import CyberPageHeader from "../components/cyber/CyberPageHeader";
import CyberPanel from "../components/cyber/CyberPanel";
import CyberButton from "../components/cyber/CyberButton";
import CyberStat, { CyberStatGrid } from "../components/cyber/CyberStat";
import SignupPrompt from "../components/SignupPrompt";
import { useGuestSave } from "../hooks/useGuestSave";

const ROWS = 9;
const COLS = 9;
const MINES = 10;

function neighbors(r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr,
        nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push([nr, nc]);
    }
  }
  return out;
}

function placeMines(safeR, safeC) {
  const mines = new Set();
  const avoid = new Set(
    [`${safeR},${safeC}`, ...neighbors(safeR, safeC).map(([a, b]) => `${a},${b}`)]
  );
  while (mines.size < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    const k = `${r},${c}`;
    if (!avoid.has(k)) mines.add(k);
  }
  const isMine = (r, c) => mines.has(`${r},${c}`);
  const counts = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isMine(r, c)) continue;
      let n = 0;
      for (const [a, b] of neighbors(r, c)) if (isMine(a, b)) n++;
      counts[r][c] = n;
    }
  }
  return { isMine, counts };
}

function flood(rev, im, ct, r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
  if (rev[r][c]) return;
  if (im(r, c)) return;
  rev[r][c] = true;
  if (ct[r][c] === 0) {
    for (const [a, b] of neighbors(r, c)) flood(rev, im, ct, a, b);
  }
}

function checkWin(rev, im) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!rev[r][c] && !im(r, c)) return false;
    }
  }
  return true;
}

export default function MinesweeperPage() {
  const [phase, setPhase] = useState("init");
  const [isMine, setIsMine] = useState(() => () => false);
  const [counts, setCounts] = useState(() => Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [revealed, setRevealed] = useState(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  );
  const [flags, setFlags] = useState(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(false))
  );
  const [boom, setBoom] = useState(false);
  const [won, setWon] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const { saveStats, isGuest } = useGuestSave();

  useEffect(() => {
    if (phase !== "play" || boom || won) return undefined;
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [phase, boom, won]);

  const flaggedCount = useMemo(
    () => flags.flat().reduce((acc, value) => acc + (value ? 1 : 0), 0),
    [flags]
  );
  const minesLeft = Math.max(0, MINES - flaggedCount);
  const liveScore = useMemo(() => {
    const revealedSafe = revealed.flat().reduce((acc, value) => acc + (value ? 1 : 0), 0) - flaggedCount;
    const revealBonus = Math.max(0, revealedSafe) * 8;
    const timePenalty = seconds * 2;
    const flagPenalty = Math.max(0, flaggedCount - MINES) * 12;
    return Math.max(0, 400 + revealBonus - timePenalty - flagPenalty);
  }, [revealed, flaggedCount, seconds]);

  const reset = () => {
    setPhase("init");
    setIsMine(() => () => false);
    setCounts(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setRevealed(Array.from({ length: ROWS }, () => Array(COLS).fill(false)));
    setFlags(Array.from({ length: ROWS }, () => Array(COLS).fill(false)));
    setBoom(false);
    setWon(false);
    setSeconds(0);
  };

  const handleCell = (r, c, e) => {
    const right = e.type === "contextmenu" || e.button === 2 || (e.ctrlKey && e.button === 0);
    if (right) {
      e.preventDefault();
      if (phase !== "play" || boom || won) return;
      setFlags((f) => {
        const n = f.map((row) => [...row]);
        if (revealed[r][c]) return f;
        n[r][c] = !n[r][c];
        return n;
      });
      return;
    }
    if (boom || won) return;
    if (phase === "play" && flags[r][c]) return;

    if (phase === "init") {
      const { isMine: im, counts: ct } = placeMines(r, c);
      setIsMine(() => im);
      setCounts(ct);
      setPhase("play");
      setRevealed((prev) => {
        const next = prev.map((row) => [...row]);
        flood(next, im, ct, r, c);
        if (checkWin(next, im)) {
          setWon(true);
          const finalScore = Math.max(0, 1200 - seconds * 8 - Math.abs(flaggedCount - MINES) * 25);
          saveStats({ game: "minesweeper", highScore: finalScore, progress: 100 });
        }
        return next;
      });
      return;
    }

    if (revealed[r][c]) return;
    if (isMine(r, c)) {
      setBoom(true);
      setRevealed((prev) => {
        const next = prev.map((row) => [...row]);
        for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) if (isMine(i, j)) next[i][j] = true;
        return next;
      });
      saveStats({ game: "minesweeper", highScore: 100, progress: 20 });
      return;
    }

    setRevealed((prev) => {
      const next = prev.map((row) => [...row]);
      flood(next, isMine, counts, r, c);
      if (checkWin(next, isMine)) {
        setWon(true);
        const finalScore = Math.max(0, 1200 - seconds * 8 - Math.abs(flaggedCount - MINES) * 25);
        saveStats({ game: "minesweeper", highScore: finalScore, progress: 100 });
      }
      return next;
    });
  };

  return (
    <GameShell accent="slate" maxWidth="md">
      <CyberPageHeader
        title="Minesweeper"
        subtitle="Clear the board quickly and flag accurately for a better final score."
        tag="STRATEGY"
      />

      {isGuest && <SignupPrompt variant="cyber" />}

      <CyberPanel>
        <CyberStatGrid>
          <CyberStat label="Time" value={`${seconds}s`} delay={0} />
          <CyberStat label="Mines left" value={minesLeft} delay={50} />
          <CyberStat label="Flags used" value={flaggedCount} delay={100} />
          <CyberStat label="Live score" value={liveScore} highlight delay={150} />
        </CyberStatGrid>

        <div className="cyber-toolbar">
          <p className="cyber-toolbar-status">
            {boom && <span className="cyber-msg--error">Mine hit.</span>}
            {won && !boom && <span className="cyber-msg--success">Board cleared! Great run.</span>}
            {!boom && !won && <span>9×9 · {MINES} mines · right-click to flag</span>}
          </p>
          <CyberButton variant="primary" onClick={reset}>
            Reset
          </CyberButton>
        </div>

        <div className="grid-minesweeper select-none" onContextMenu={(e) => e.preventDefault()}>
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const r = Math.floor(i / COLS),
              c = i % COLS;
            const rev = phase === "init" ? false : revealed[r][c];
            const flag = flags[r][c];
            const mine = phase !== "init" && isMine(r, c);
            let label = "";
            if (flag && !rev) label = "🚩";
            else if (rev && !mine) label = counts[r][c] ? String(counts[r][c]) : "";
            if (boom && mine) label = "💥";

            let cellClass = "cyber-mine-cell ";
            if (rev && mine) cellClass += "is-mine";
            else if (rev) cellClass += "is-revealed";
            else if (flag) cellClass += "is-hidden is-flagged";
            else cellClass += "is-hidden";

            return (
              <button
                key={i}
                type="button"
                className={cellClass}
                data-n={rev && !mine && counts[r][c] ? counts[r][c] : undefined}
                onClick={(e) => handleCell(r, c, e)}
                onContextMenu={(e) => handleCell(r, c, e)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </CyberPanel>
    </GameShell>
  );
}