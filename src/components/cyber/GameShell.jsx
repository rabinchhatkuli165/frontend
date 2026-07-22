import Navbar from "../Navbar";
import CyberBackground from "./CyberBackground";
import "../../styles/CyberTheme.css";

export default function GameShell({ children, maxWidth = "lg", accent = "cyan" }) {
  return (
    <div className={`game-shell accent-${accent}`}>
      <CyberBackground />
      <Navbar />
      <main className={`game-main game-main--${maxWidth}`}>{children}</main>
    </div>
  );
}
