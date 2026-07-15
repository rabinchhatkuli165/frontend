import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import api from "../api";

const symbols = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F"];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MemoryMatchPage() {
  const [deck, setDeck] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [message, setMessage] = useState("Find your first pair!");

  useEffect(() => {
    setDeck(shuffle(symbols));
  }, []);

  const completed = useMemo(() => matched.length === symbols.length, [matched.length]);
  const liveScore = useMemo(() => {
    const base = 1000;
    const movePenalty = moves * 18;
    const timePenalty = elapsedSeconds * 3;
    const comboBonus = bestCombo * 25;
    return Math.max(0, base - movePenalty - timePenalty + comboBonus);
  }, [moves, elapsedSeconds, bestCombo]);

  useEffect(() => {
    if (completed) return undefined;
    const interval = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [completed]);

  useEffect(() => {
    if (selected.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = selected;
      if (deck[first] === deck[second]) {
        setMatched((prev) => [...prev, first, second]);
        setCombo((prev) => {
          const next = prev + 1;
          setBestCombo((best) => Math.max(best, next));
          return next;
        });
        setMessage("Nice match! Keep the streak going.");
      } else {
        setCombo(0);
        setMessage("No match. Try to remember the card positions.");
      }
      setTimeout(() => setSelected([]), 500);
    }
  }, [selected, deck]);

  useEffect(() => {
    if (!completed) return;
    const score = liveScore;
    setMessage(`Board complete in ${moves} moves and ${elapsedSeconds}s.`);
    api.put("/auth/profile/stats", { game: "memoryMatch", highScore: score, progress: 100 });
  }, [completed, moves, elapsedSeconds, liveScore]);

  const reveal = (index) => {
    if (selected.includes(index) || matched.includes(index) || selected.length === 2) return;
    setSelected((prev) => [...prev, index]);
  };

  const restart = () => {
    setDeck(shuffle(symbols));
    setSelected([]);
    setMatched([]);
    setMoves(0);
    setElapsedSeconds(0);
    setCombo(0);
    setBestCombo(0);
    setMessage("New board started. Good luck!");
  };

  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <PageHeader
          title="Memory Match"
          subtitle="Build streaks for bonus points. Faster clears and fewer moves produce higher scores."
        />

        <div className="card-elevated p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Moves</p>
              <p className="text-xl font-bold text-slate-900">{moves}</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Time</p>
              <p className="text-xl font-bold text-slate-900">{elapsedSeconds}s</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3">
              <p className="text-xs text-indigo-600 uppercase tracking-wide">Best combo</p>
              <p className="text-xl font-bold text-indigo-700">{bestCombo}x</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs text-emerald-600 uppercase tracking-wide">Live score</p>
              <p className="text-xl font-bold text-emerald-700">{liveScore}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <p className="text-sm text-slate-600">
              Current streak: <span className="font-semibold text-slate-900">{combo}x</span>
            </p>
            <button
              type="button"
              className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition"
              onClick={restart}
            >
              Shuffle & restart
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {deck.map((card, index) => {
              const isRevealed = selected.includes(index) || matched.includes(index);
              return (
                <button
                  type="button"
                  key={`${card}-${index}`}
                  className={`h-20 sm:h-24 rounded-2xl text-xl font-bold shadow-inner transition transform active:scale-95 ${
                    isRevealed
                      ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
                      : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                  }`}
                  onClick={() => reveal(index)}
                >
                  {isRevealed ? card : "?"}
                </button>
              );
            })}
          </div>

          {completed && (
            <p className="mt-6 text-emerald-700 font-semibold flex items-center gap-2">
              <span aria-hidden>✓</span> Great! All pairs matched. Final score: {liveScore}
            </p>
          )}
          {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
        </div>
      </main>
    </div>
  );
}
