import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const USER_RE = /^[a-zA-Z0-9_-]{3,32}$/;

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!USER_RE.test(form.username.trim())) {
      setError("Username: 3–32 characters, letters, numbers, _ or - only.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const res = await api.post("/auth/signup", {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password
      });

      if (res.data.needsVerification === true) {
        setSentTo(res.data.email || form.email.trim());
        setDone(true);
        return;
      }

      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch {
      setError("Signup failed. Try a different email.");
    }
  };

  if (done) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center p-6">
        <div className="card-elevated max-w-md w-full p-8 space-y-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            We sent a verification link to <strong>{sentTo}</strong>. Open it to activate your account, then sign in
            here.
          </p>
          <p className="text-xs text-slate-500">
            No SMTP configured? Check the server console — the link is printed there in development.
          </p>
          <Link className="btn-primary !w-auto px-8 mx-auto inline-flex" to="/login">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-90 signup-hero-layer" aria-hidden />
        <div className="relative z-10 max-w-md">
          <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest mb-3">Join the board</p>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">One profile. Every puzzle.</h1>
          <p className="text-indigo-100/90 text-lg leading-relaxed">
            Create an account to save high scores and pick up where you left off on any device.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <form
          className="card-elevated w-full max-w-md p-8 sm:p-10 space-y-5 shadow-glass"
          onSubmit={handleSubmit}
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
            <p className="text-slate-500 text-sm mt-1">Takes less than a minute.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="su-user">
              Username
            </label>
            <input
              id="su-user"
              className="input-field"
              autoComplete="username"
              placeholder="player_one"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <p className="text-xs text-slate-400 mt-1">Letters, numbers, underscore, or hyphen.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="su-email">
              Email
            </label>
            <input
              id="su-email"
              className="input-field"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="su-pass">
              Password
            </label>
            <input
              id="su-pass"
              className="input-field"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && (
            <p className="text-rose-600 text-sm bg-rose-50 border border-rose-100 rounded-lg px-3 py-2" role="alert">
              {error}
            </p>
          )}

          <button className="btn-primary" type="submit">
            Create account
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
