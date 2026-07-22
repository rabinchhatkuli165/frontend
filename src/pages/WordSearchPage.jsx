import { useMemo, useState } from "react";
import GameShell from "../components/cyber/GameShell";
import CyberPageHeader from "../components/cyber/CyberPageHeader";
import CyberPanel from "../components/cyber/CyberPanel";
import CyberButton from "../components/cyber/CyberButton";
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
    <GameShell accent="teal" maxWidth="lg">
      <CyberPageHeader
        title="Word Search"
        subtitle="Words can appear horizontally in any row. Type a word from the list when you spot it."
        tag="WORD"
      />

      {isGuest && <SignupPrompt variant="cyber" />}

      <CyberPanel>
        <div className="cyber-sudoku-wrap">
          <div className="cyber-word-grid">
            {grid.flat().map((letter, idx) => (
              <div key={`${letter}-${idx}`} className="cyber-word-cell">
                {letter}
              </div>
            ))}
          </div>
        </div>

        <div className="cyber-word-tags">
          {words.map((word) => (
            <span
              key={word}
              className={`cyber-word-tag${found.includes(word) ? " is-found" : ""}`}
            >
              {word}
            </span>
          ))}
        </div>

        <div className="cyber-word-form">
          <input
            className="cyber-input"
            placeholder="Type a found word"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkWord()}
          />
          <CyberButton variant="primary" onClick={checkWord}>
            Submit
          </CyberButton>
        </div>

        {message && <p className="cyber-msg">{message}</p>}
        {completed && (
          <p className="cyber-msg cyber-msg--success">✓ All words found. Nice work!</p>
        )}
      </CyberPanel>
    </GameShell>
  );
}
