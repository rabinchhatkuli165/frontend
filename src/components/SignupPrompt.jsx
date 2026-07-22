import { useState } from "react";
import { Link } from "react-router-dom";

export default function SignupPrompt({ message, dismissible = true }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 mb-6">
      <p className="text-sm text-indigo-900">
        {message || "You're playing as a guest. Sign up to save your progress and sync it across devices."}
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <Link to="/signup" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          Create account
        </Link>
        <Link to="/login" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          Log in
        </Link>
        {dismissible && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-indigo-400 hover:text-indigo-600 text-sm"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}