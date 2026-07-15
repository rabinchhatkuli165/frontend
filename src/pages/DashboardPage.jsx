import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const games = [
  {
    key: "memory-match",
    title: "Memory Match",
    description: "Flip cards and match pairs — fewer moves, higher score.",
    icon: "🃏",
    accent: "from-violet-500 to-fuchsia-500"
  },
  {
    key: "sudoku",
    title: "Sudoku",
    description: "Fill the grid with logic; mistakes cost your final score.",
    icon: "9️⃣",
    accent: "from-indigo-500 to-blue-500"
  },
  {
    key: "word-search",
    title: "Word Search",
    description: "Spot every word hidden in the letter grid.",
    icon: "🔤",
    accent: "from-emerald-500 to-teal-500"
  },
  {
    key: "2048",
    title: "2048",
    description: "Slide and merge tiles on a 4×4 board — reach 2048.",
    icon: "🔢",
    accent: "from-amber-500 to-orange-600"
  },
  {
    key: "minesweeper",
    title: "Minesweeper",
    description: "Clear the field without detonating hidden mines.",
    icon: "💣",
    accent: "from-slate-600 to-slate-800"
  },
  {
    key: "reaction",
    title: "Reaction time",
    description: "Tap when the screen turns green — lower ms is better.",
    icon: "⚡",
    accent: "from-lime-500 to-green-600"
  }
];

export default function DashboardPage() {
  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-10 text-center sm:text-left">
          <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-2">Your arcade</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Choose a puzzle</h1>
          <p className="mt-2 text-indigo-100/80 max-w-xl">
            Pick a game below. Progress and high scores sync to your profile automatically.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.key}
              to={`/games/${game.key}`}
              className="game-card group block p-6 sm:p-7"
            >
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl text-2xl bg-gradient-to-br ${game.accent} text-white shadow-lg mb-4`}
              >
                <span aria-hidden>{game.icon}</span>
              </div>
              <h2 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 transition relative z-10">
                {game.title}
              </h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed relative z-10">{game.description}</p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-indigo-600 relative z-10">
                Play now <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
