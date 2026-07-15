import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    if (searchParams.get("verified")) {
      setInfo("Email verified — you can sign in now.");
    }
    if (searchParams.get("reset") === "ok") {
      setInfo("Password updated — sign in with your new password.");
    }
  }, [searchParams]);

  const resendVerification = async () => {
    const email = pendingEmail || form.email.trim();
    if (!email.includes("@")) {
      setError("Enter the email you used to register.");
      return;
    }
    try {
      await api.post("/auth/resend-verification", { email });
      setInfo("If an account exists for that email, a verification message was sent.");
      setError("");
    } catch {
      setError("Could not resend. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!form.email.includes("@") || form.password.length < 6) {
      setError("Enter a valid email and password (min 6 chars).");
      return;
    }
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        setPendingEmail(err.response.data.email || form.email.trim());
        setError("Verify your email before signing in.");
        return;
      }
      setError("Login failed. Check credentials.");
    }
  };

  return (
    <div className="app-shell min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-90 auth-panel-layer" aria-hidden />
        <div className="relative z-10 max-w-md">
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-widest mb-3">Welcome back</p>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">Play smarter. Track every win.</h1>
          <p className="text-indigo-100/90 text-lg leading-relaxed">
            Sign in to sync scores across puzzles and manage your profile.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <form
          className="card-elevated w-full max-w-md p-8 sm:p-10 space-y-5 shadow-glass"
          onSubmit={handleSubmit}
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
            <p className="text-slate-500 text-sm mt-1">Use your account to continue.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="input-field"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="input-field"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div className="text-right mt-1">
              <Link className="text-sm font-semibold text-indigo-600 hover:text-indigo-500" to="/forgot-password">
                Forgot password?
              </Link>
            </div>
          </div>

          {info && (
            <p className="text-emerald-700 text-sm bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2" role="status">
              {info}
            </p>
          )}
          {error && (
            <p className="text-rose-600 text-sm bg-rose-50 border border-rose-100 rounded-lg px-3 py-2" role="alert">
              {error}
            </p>
          )}

          {pendingEmail && (
            <button
              type="button"
              className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-500 py-2"
              onClick={resendVerification}
            >
              Resend verification email
            </button>
          )}

          <button className="btn-primary" type="submit">
            Sign in
          </button>

          <p className="text-center text-sm text-slate-600">
            New here?{" "}
            <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/signup">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
