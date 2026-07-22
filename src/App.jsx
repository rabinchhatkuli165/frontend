import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import MemoryMatchPage from "./pages/MemoryMatchPage";
import SudokuPage from "./pages/SudokuPage";
import WordSearchPage from "./pages/WordSearchPage";
import Game2048Page from "./pages/Game2048Page";
import MinesweeperPage from "./pages/MinesweeperPage";
import ReactionTimePage from "./pages/ReactionTimePage";
import SnakePage from "./pages/Snakepage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Public: guests can browse the dashboard and see a limited profile preview */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Public: guests can play every game; progress is saved locally until they sign up */}
      <Route path="/games/memory-match" element={<MemoryMatchPage />} />
      <Route path="/games/sudoku" element={<SudokuPage />} />
      <Route path="/games/word-search" element={<WordSearchPage />} />
      <Route path="/games/2048" element={<Game2048Page />} />
      <Route path="/games/minesweeper" element={<MinesweeperPage />} />
      <Route path="/games/reaction" element={<ReactionTimePage />} />
      <Route path="/games/snake" element={<SnakePage />} />
    </Routes>
  );
}