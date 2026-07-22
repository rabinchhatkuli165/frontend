import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import SignupPrompt from "../components/SignupPrompt";
import { useGuestSave } from "../hooks/useGuestSave";

export default function ReactionTimePage() {
  const [phase, setPhase] = useState("idle");
  const [ms, setMs] = useState(null);
  const [best, setBest] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("Tap to start your first round.");
  const startAt = useRef(0);
  const timer = useRef(null);
  const { saveStats, isGuest } = useGuestSave();

  useEffect(() => () => clearTimeout(timer.current), []);

  const startRound = () => {
    setPhase("wait");
    setMs(null);
    setMessage("Wait for green...");
    const delay = 1500 + Math.random() * 2500;
    timer.current = setTimeout(() => {
      startAt.current = performance.now();
      setPhase("go");
      setMessage("Tap now!");
    }, delay);
  };

  const tap = () => {
    if (phase === "wait") {
      clearTimeout(timer.current);
      setPhase("idle");
      setMs(-1);
      setStreak(0);
      setMessage("Too early. Streak reset.");
      return;
    }
    if (phase === "go") {
      const t = Math.round(performance.now() - startAt.current);
      setMs(t);
      setPhase("result");
      const score = Math.max(0, 10000 - t);
      setBest((prev) => (prev == null ? t : Math.min(prev, t)));
      setRounds((prev) => [t, ...prev].slice(0, 5));
      setStreak((prev) => (t < 280 ? prev + 1 : 0));
      setMessage(t < 220 ? "Lightning fast!" : t < 300 ? "Nice reaction." : "Good try, go faster.");
      saveStats({
        game: "reactionTap",
        highScore: score,
        bestTime: t,
        progress: 100
      });
      return;
    }
    if (phase === "idle" || phase === "result") {
      startRound();
    }
  };

  const bg =
    phase === "go"
      ? "bg-emerald-500"
      : phase === "wait"
        ? "bg-rose-400"
        : "bg-slate-700";

  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <PageHeader
          title="Reaction time"
          subtitle="Tap as soon as the panel turns green. Build a streak of fast rounds to stay sharp."
        />

        {isGuest && <SignupPrompt />}

        <div className="card-elevated p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Best</p>
              <p className="text-lg font-bold text-slate-900">{best ?? "--"}{best != null ? " ms" : ""}</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3">
              <p className="text-xs text-indigo-600 uppercase tracking-wide">Streak</p>
              <p className="text-lg font-bold text-indigo-700">{streak}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs text-emerald-600 uppercase tracking-wide">Last</p>
              <p className="text-lg font-bold text-emerald-700">{ms != null && ms >= 0 ? `${ms} ms` : "--"}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-xs text-amber-600 uppercase tracking-wide">Rounds</p>
              <p className="text-lg font-bold text-amber-700">{rounds.length}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={tap}
            className={`w-full rounded-2xl py-24 sm:py-32 text-white text-xl font-bold transition-colors ${bg} shadow-inner`}
          >
            {phase === "idle" && "Tap to start"}
            {phase === "wait" && "Wait for green…"}
            {phase === "go" && "Tap now!"}
            {phase === "result" && ms != null && ms >= 0 && `${ms} ms`}
            {phase === "result" && ms === -1 && "Too early!"}
          </button>
          {best != null && ms != null && ms >= 0 && (
            <p className="text-center text-slate-600">
              Best this session: <span className="font-bold text-slate-900">{best} ms</span>
            </p>
          )}
          <p className="text-center text-sm text-slate-600">{message}</p>
          {rounds.length > 1 && (
            <p className="text-center text-xs text-slate-500">
              Last {rounds.length} avg: {Math.round(rounds.reduce((a, b) => a + b, 0) / rounds.length)} ms
            </p>
          )}
          <p className="text-xs text-slate-500 text-center">
            Score sent as higher = faster reaction (10000 − milliseconds).
          </p>
        </div>
      </main>
    </div>
  );
}