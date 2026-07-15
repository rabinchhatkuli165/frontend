import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const token = searchParams.get("token");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!token) {
      setErr("Invalid reset link.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    try {
      await api.post("/auth/reset-password", { token, password });
      setOk(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch {
      setErr("Invalid or expired link. Request a new reset email.");
    }
  };

  return (
    <div className="app-shell min-h-screen flex items-center justify-center p-6">
      <form className="card-elevated w-full max-w-md p-8 space-y-5" onSubmit={submit}>
        <h1 className="text-2xl font-bold text-slate-900">New password</h1>
        {!token && <p className="text-rose-600 text-sm">Missing token in URL.</p>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="rp-pass">
            New password
          </label>
          <input
            id="rp-pass"
            className="input-field"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {err && <p className="text-rose-600 text-sm">{err}</p>}
        {ok && <p className="text-emerald-700 text-sm">Password updated. Redirecting to login…</p>}
        <button className="btn-primary" type="submit" disabled={!token || ok}>
          Save password
        </button>
        <p className="text-center text-sm text-slate-600">
          <Link className="font-semibold text-indigo-600" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
