import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import PageHeader from "../components/PageHeader";
import SignupPrompt from "../components/SignupPrompt";
import { useGuestSave } from "../hooks/useGuestSave";

const grid = [
  ["R", "E", "A", "C", "T", "Q", "L", "M"],
  ["N", "O", "D", "E", "J", "S", "O", "N"],
  ["P", "U", "Z", "Z", "L", "E", "A", "I"],
  ["M", "O", "N", "G", "O", "D", "B", "S"],
  ["T", "O", "K", "E", "N", "X", "C", "E"],
  ["S", "E", "A", "R", "C", "H", "D", "R"],
  ["G", "A", "M", "E", "S", "Y", "E", "T"],
  ["U", "S", "E", "R", "S", "V", "F", "W"]
];

const words = ["REACT", "NODE", "MONGO", "TOKEN", "SEARCH", "GAMES", "USERS"];

export default function WordSearchPage() {
  const [entry, setEntry] = useState("");
  const [found, setFound] = useState([]);
  const [message, setMessage] = useState("");
  const { saveStats, isGuest } = useGuestSave();

  const completed = useMemo(() => found.length === words.length, [found.length]);

  const checkWord = async () => {
    const value = entry.toUpperCase().trim();
    if (!words.includes(value)) {
      setMessage("That word is not in the target list.");
      return;
    }
    if (found.includes(value)) {
      setMessage("Word already found.");
      return;
    }

    const nextFound = [...found, value];
    setFound(nextFound);
    setEntry("");
    setMessage(`Found ${value}!`);

    if (nextFound.length === words.length) {
      await saveStats({
        game: "wordSearch",
        highScore: nextFound.length * 100,
        progress: 100
      });
    } else {
      await saveStats({
        game: "wordSearch",
        progress: Math.round((nextFound.length / words.length) * 100)
      });
    }
  };

  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <PageHeader
          title="Word Search"
          subtitle="Words can appear horizontally in any row. Type a word from the list when you spot it."
        />

        {isGuest && <SignupPrompt />}

        <div className="card-elevated p-6 sm:p-8 overflow-x-auto">
          <div className="inline-grid grid-cols-8 gap-1 bg-gradient-to-br from-teal-600 to-emerald-700 p-3 rounded-2xl shadow-inner">
            {grid.flat().map((letter, idx) => (
              <div
                key={`${letter}-${idx}`}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/95 flex items-center justify-center font-bold text-slate-800 text-sm sm:text-base shadow"
              >
                {letter}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {words.map((word) => (
              <span
                key={word}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  found.includes(word) ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-700"
                }`}
              >
                {word}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <input
              className="input-field flex-1"
              placeholder="Type a found word"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkWord()}
            />
            <button
              type="button"
              className="rounded-xl bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 transition sm:w-auto w-full"
              onClick={checkWord}
            >
              Submit
            </button>
          </div>

          {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
          {completed && (
            <p className="mt-3 text-emerald-700 font-semibold flex items-center gap-2">
              <span aria-hidden>✓</span> All words found. Nice work!
            </p>
          )}
        </div>
      </main>
    </div>
  );
}