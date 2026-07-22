import { useEffect, useRef, useState } from "react";
import GameShell from "../components/cyber/GameShell";
import CyberPageHeader from "../components/cyber/CyberPageHeader";
import CyberPanel from "../components/cyber/CyberPanel";
import CyberStat, { CyberStatGrid } from "../components/cyber/CyberStat";
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

  const padClass =
    phase === "go"
      ? "is-go"
      : phase === "wait"
        ? "is-wait"
        : phase === "result"
          ? "is-result"
          : "is-idle";

  return (
    <GameShell accent="lime" maxWidth="md">
      <CyberPageHeader
        title="Reaction Time"
        subtitle="Tap as soon as the panel turns green. Build a streak of fast rounds to stay sharp."
        tag="REFLEX"
      />

      {isGuest && <SignupPrompt variant="cyber" />}

      <CyberPanel>
        <CyberStatGrid>
          <CyberStat label="Best" value={best != null ? `${best} ms` : "—"} highlight delay={0} />
          <CyberStat label="Streak" value={streak} delay={50} />
          <CyberStat label="Last" value={ms != null && ms >= 0 ? `${ms} ms` : "—"} delay={100} />
          <CyberStat label="Rounds" value={rounds.length} delay={150} />
        </CyberStatGrid>

        <button type="button" onClick={tap} className={`cyber-reaction-pad ${padClass}`}>
          {phase === "idle" && "Tap to start"}
          {phase === "wait" && "Wait for green…"}
          {phase === "go" && "Tap now!"}
          {phase === "result" && ms != null && ms >= 0 && `${ms} ms`}
          {phase === "result" && ms === -1 && "Too early!"}
        </button>

        {best != null && ms != null && ms >= 0 && (
          <p className="cyber-msg" style={{ textAlign: "center" }}>
            Best this session: <strong style={{ color: "var(--cyber-accent)" }}>{best} ms</strong>
          </p>
        )}
        <p className="cyber-msg" style={{ textAlign: "center" }}>{message}</p>
        {rounds.length > 1 && (
          <p className="cyber-hint">
            Last {rounds.length} avg: {Math.round(rounds.reduce((a, b) => a + b, 0) / rounds.length)} ms
          </p>
        )}
      </CyberPanel>
    </GameShell>
  );
}
