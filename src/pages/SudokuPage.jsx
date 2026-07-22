import { useEffect, useMemo, useState } from "react";
import GameShell from "../components/cyber/GameShell";
import CyberPageHeader from "../components/cyber/CyberPageHeader";
import CyberPanel from "../components/cyber/CyberPanel";
import CyberStat, { CyberStatGrid } from "../components/cyber/CyberStat";
import SignupPrompt from "../components/SignupPrompt";
import { useGuestSave } from "../hooks/useGuestSave";

const puzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

export default function SudokuPage() {
  const [grid, setGrid] = useState(puzzle.map((row) => [...row]));
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState(0);
  const { saveStats, isGuest } = useGuestSave();

  const complete = useMemo(() => JSON.stringify(grid) === JSON.stringify(solution), [grid]);

  useEffect(() => {
    if (complete) {
      const score = Math.max(0, 1000 - errors * 50);
      saveStats({ game: "sudoku", highScore: score, progress: 100 });
      setMessage("Sudoku solved!");
    }
  }, [complete, errors]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateCell = (r, c, value) => {
    if (puzzle[r][c] !== 0) return;
    if (value === "") {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = 0;
        return next;
      });
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num) || num < 1 || num > 9) return;
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = num;
      return next;
    });
    if (num !== solution[r][c]) {
      setErrors((e) => e + 1);
    }
  };

  const cellClass = (r, c) => {
    const parts = ["cyber-sudoku-cell"];
    if (puzzle[r][c]) parts.push("is-clue");
    else if (grid[r][c] && grid[r][c] !== solution[r][c]) parts.push("is-error");
    if (r === 2 || r === 5) parts.push("thick-b");
    if (c === 2 || c === 5) parts.push("thick-r");
    return parts.join(" ");
  };

  const score = Math.max(0, 1000 - errors * 50);

  return (
    <GameShell accent="blue" maxWidth="lg">
      <CyberPageHeader
        title="Sudoku"
        subtitle="Complete the grid. Clues are locked; wrong entries count against your score."
        tag="LOGIC"
      />

      {isGuest && <SignupPrompt variant="cyber" />}

      <CyberPanel>
        <CyberStatGrid>
          <CyberStat label="Errors" value={errors} delay={0} />
          <CyberStat label="Live score" value={score} highlight delay={50} />
        </CyberStatGrid>

        <div className="cyber-sudoku-wrap">
          <div className="cyber-sudoku-grid">
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <input
                  key={`${r}-${c}`}
                  className={cellClass(r, c)}
                  value={cell === 0 ? "" : cell}
                  onChange={(e) => updateCell(r, c, e.target.value)}
                  disabled={puzzle[r][c] !== 0}
                  inputMode="numeric"
                />
              ))
            )}
          </div>
        </div>

        {message && <p className="cyber-msg cyber-msg--success">{message}</p>}
      </CyberPanel>
    </GameShell>
  );
}
