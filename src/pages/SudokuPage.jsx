import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
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

  const thickBorder = (r, c) => {
    const br = r === 2 || r === 5 ? "border-b-2 border-slate-400" : "";
    const bc = c === 2 || c === 5 ? "border-r-2 border-slate-400" : "";
    return `${br} ${bc}`;
  };

  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <PageHeader
          title="Sudoku"
          subtitle="Complete the grid. Clues are locked; wrong entries count against your score."
        />

        {isGuest && <SignupPrompt />}

        <div className="card-elevated p-6 sm:p-8 overflow-x-auto">
          <p className="text-slate-600 mb-4">
            Incorrect entries: <span className="font-bold text-slate-900">{errors}</span>
          </p>
          <div className="inline-grid grid-cols-9 gap-0 bg-slate-800 p-2 rounded-xl shadow-inner">
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <input
                  key={`${r}-${c}`}
                  className={`w-8 h-8 sm:w-10 sm:h-10 text-center text-sm sm:text-base font-semibold border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-400 focus:z-10 ${thickBorder(r, c)} ${
                    puzzle[r][c] ? "bg-slate-200 text-slate-900 cursor-not-allowed" : "bg-white text-indigo-900"
                  }`}
                  value={cell === 0 ? "" : cell}
                  onChange={(e) => updateCell(r, c, e.target.value)}
                  disabled={puzzle[r][c] !== 0}
                  inputMode="numeric"
                />
              ))
            )}
          </div>
          {message && <p className="mt-6 text-emerald-700 font-semibold">{message}</p>}
        </div>
      </main>
    </div>
  );
}