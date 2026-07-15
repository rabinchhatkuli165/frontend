import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!email.includes("@")) {
      setErr("Enter a valid email.");
      return;
    }
    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim() });
      setMsg(res.data.message);
    } catch {
      setErr("Something went wrong. Try again.");
    }
  };

  return (
    <div className="app-shell min-h-screen flex items-center justify-center p-6">
      <form className="card-elevated w-full max-w-md p-8 space-y-5" onSubmit={submit}>
        <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
        <p className="text-sm text-slate-600">
          We’ll email a reset link if an account exists for this address.
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="fp-email">
            Email
          </label>
          <input
            id="fp-email"
            className="input-field"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {err && <p className="text-rose-600 text-sm">{err}</p>}
        {msg && <p className="text-emerald-700 text-sm bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">{msg}</p>}
        <button className="btn-primary" type="submit">
          Send reset link
        </button>
        <p className="text-center text-sm text-slate-600">
          <Link className="font-semibold text-indigo-600" to="/login">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
