import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="glass-nav text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link className="font-bold text-lg tracking-tight flex items-center gap-2" to="/dashboard">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-sm shadow-lg"
            aria-hidden
          >
            ◆
          </span>
          Puzzle Platform
        </Link>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center">
          <Link className="text-indigo-100 hover:text-white transition" to="/dashboard">
            Dashboard
          </Link>
          <Link className="text-indigo-100 hover:text-white transition" to="/profile">
            Profile
          </Link>
          {user && (
            <span className="text-indigo-200/90 hidden sm:inline">
              Hi, <span className="font-semibold text-white">{user.username}</span>
            </span>
          )}
          <button type="button" className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
