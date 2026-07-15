import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing token. Open the link from your email.");
      return;
    }
    ran.current = true;
    api
      .post("/auth/verify-email", { token })
      .then((res) => {
        login(res.data.token, res.data.user);
        setStatus("ok");
        setMessage("Email verified. Redirecting…");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
      })
      .catch(() => {
        setStatus("error");
        setMessage("Invalid or expired link. Request a new one from the login page.");
      });
  }, [searchParams, login, navigate]);

  return (
    <div className="app-shell min-h-screen flex items-center justify-center p-6">
      <div className="card-elevated max-w-md w-full p-8 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Email verification</h1>
        {status === "loading" && <p className="text-slate-600">Confirming your email…</p>}
        {status !== "loading" && <p className="text-slate-600">{message}</p>}
        {status === "error" && (
          <Link className="inline-block font-semibold text-indigo-600" to="/login">
            Back to login
          </Link>
        )}
      </div>
    </div>
  );
}
