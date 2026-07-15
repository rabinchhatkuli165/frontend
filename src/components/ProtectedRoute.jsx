import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div
            className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"
            aria-hidden
          />
          <p className="mt-4 text-indigo-100 text-sm font-medium">Loading your session…</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
