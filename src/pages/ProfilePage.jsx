import { useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const GAME_META = {
  memoryMatch: { label: "Memory Match", emoji: "🃏" },
  sudoku: { label: "Sudoku", emoji: "9️⃣" },
  wordSearch: { label: "Word Search", emoji: "🔤" },
  game2048: { label: "2048", emoji: "🔢" },
  minesweeper: { label: "Minesweeper", emoji: "💣" },
  reactionTap: { label: "Reaction", emoji: "⚡" }
};

function statsToEntries(gameStats) {
  if (!gameStats) return [];
  const raw =
    gameStats instanceof Map ? Object.fromEntries(gameStats) : typeof gameStats === "object" ? gameStats : {};
  return Object.entries(raw).map(([key, val]) => ({
    key,
    label: GAME_META[key]?.label || key,
    emoji: GAME_META[key]?.emoji || "🎮",
    highScore: val?.highScore ?? 0,
    progress: val?.progress ?? 0,
    bestTime: val?.bestTime ?? 0
  }));
}

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    refreshProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(
    () => statsToEntries(user?.gameStats).sort((a, b) => (b.highScore ?? 0) - (a.highScore ?? 0)),
    [user?.gameStats]
  );
  const totalScore = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.highScore) || 0), 0),
    [rows]
  );
  const averageProgress = useMemo(() => {
    if (!rows.length) return 0;
    return Math.round(rows.reduce((sum, row) => sum + (Number(row.progress) || 0), 0) / rows.length);
  }, [rows]);

  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="card-elevated overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 sm:px-8 py-8 text-white">
            <p className="text-indigo-100 text-sm font-medium uppercase tracking-widest">Profile</p>
            <h1 className="text-3xl font-bold mt-1">{user?.username || "…"}</h1>
            <p className="text-indigo-100/90 mt-2 flex flex-wrap items-center gap-2">
              {user?.email}
              {user?.emailVerified ? (
                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">Verified</span>
              ) : (
                <span className="text-xs font-semibold bg-amber-400/30 px-2 py-0.5 rounded-full">Unverified</span>
              )}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Game stats</h2>
            {rows.length === 0 ? (
              <p className="text-slate-500 text-sm">Play a game to see scores and progress here.</p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-3 mb-5">
                  <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-indigo-600">Total score</p>
                    <p className="text-2xl font-bold text-indigo-700">{totalScore}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-emerald-600">Games played</p>
                    <p className="text-2xl font-bold text-emerald-700">{rows.length}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-amber-600">Avg progress</p>
                    <p className="text-2xl font-bold text-amber-700">{averageProgress}%</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rows.map((row, index) => (
                  <div
                    key={row.key}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                      <span className="text-xl" aria-hidden>
                        {row.emoji}
                      </span>
                      <span className="font-semibold text-slate-900">{row.label}</span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          index === 0
                            ? "bg-amber-100 text-amber-700"
                            : index === 1
                              ? "bg-slate-200 text-slate-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </div>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">High score</dt>
                        <dd className="font-medium text-slate-900">{row.highScore ?? 0}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Progress</dt>
                        <dd className="font-medium text-slate-900">{row.progress ?? 0}%</dd>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{ width: `${Math.min(100, Math.max(0, Number(row.progress) || 0))}%` }}
                        />
                      </div>
                      {row.bestTime > 0 && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">{row.key === "reactionTap" ? "Best (ms)" : "Best time"}</dt>
                          <dd className="font-medium text-slate-900">
                            {row.key === "reactionTap" ? row.bestTime : `${row.bestTime}s`}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
