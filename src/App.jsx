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
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/memory-match"
        element={
          <ProtectedRoute>
            <MemoryMatchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/sudoku"
        element={
          <ProtectedRoute>
            <SudokuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/word-search"
        element={
          <ProtectedRoute>
            <WordSearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/2048"
        element={
          <ProtectedRoute>
            <Game2048Page />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/minesweeper"
        element={
          <ProtectedRoute>
            <MinesweeperPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/reaction"
        element={
          <ProtectedRoute>
            <ReactionTimePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
