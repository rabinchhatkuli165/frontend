import { useEffect, useMemo, useState } from "react";
import GameShell from "../components/cyber/GameShell";
import CyberPageHeader from "../components/cyber/CyberPageHeader";
import CyberPanel from "../components/cyber/CyberPanel";
import CyberButton from "../components/cyber/CyberButton";
import CyberStat, { CyberStatGrid } from "../components/cyber/CyberStat";
import SignupPrompt from "../components/SignupPrompt";
import { useGuestSave } from "../hooks/useGuestSave";

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
  const { saveStats, isGuest } = useGuestSave();

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
    setMessage(`Board complete in ${moves} moves and ${elapsedSeconds}s.`);
    saveStats({ game: "memoryMatch", highScore: liveScore, progress: 100 });
  }, [completed, moves, elapsedSeconds, liveScore]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <GameShell accent="violet" maxWidth="lg">
      <CyberPageHeader
        title="Memory Match"
        subtitle="Build streaks for bonus points. Faster clears and fewer moves produce higher scores."
        tag="PUZZLE"
      />

      {isGuest && <SignupPrompt variant="cyber" />}

      <CyberPanel>
        <CyberStatGrid>
          <CyberStat label="Moves" value={moves} delay={0} />
          <CyberStat label="Time" value={`${elapsedSeconds}s`} delay={50} />
          <CyberStat label="Best combo" value={`${bestCombo}x`} highlight delay={100} />
          <CyberStat label="Live score" value={liveScore} highlight delay={150} />
        </CyberStatGrid>

        <div className="cyber-toolbar">
          <p className="cyber-toolbar-status">
            Current streak: <strong style={{ color: "var(--cyber-accent)" }}>{combo}x</strong>
          </p>
          <CyberButton variant="primary" onClick={restart}>
            Shuffle & restart
          </CyberButton>
        </div>

        <div className="cyber-memory-grid">
          {deck.map((card, index) => {
            const isRevealed = selected.includes(index) || matched.includes(index);
            const isMatched = matched.includes(index);
            return (
              <button
                type="button"
                key={`${card}-${index}`}
                className={`cyber-memory-card${isRevealed ? " is-revealed" : ""}${isMatched ? " is-matched" : ""}`}
                onClick={() => reveal(index)}
              >
                {isRevealed ? card : "?"}
              </button>
            );
          })}
        </div>

        {completed && (
          <p className="cyber-msg cyber-msg--success">
            ✓ Great! All pairs matched. Final score: {liveScore}
          </p>
        )}
        {message && !completed && <p className="cyber-msg">{message}</p>}
      </CyberPanel>
    </GameShell>
  );
}
