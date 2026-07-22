import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { readGuestStats, clearGuestStats, hasGuestStats } from "../hooks/useGuestSave";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/profile")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Pushes any locally-saved guest scores up to the server, then clears them.
  // Best-effort: a failed sync just leaves the local copy in place to retry later.
  const syncGuestStats = async () => {
    if (!hasGuestStats()) return;
    const stats = readGuestStats();
    try {
      await Promise.all(
        Object.entries(stats).map(([game, data]) => api.put("/auth/profile/stats", { game, ...data }))
      );
      clearGuestStats();
    } catch {
      // leave local stats in place, try again next login
    }
  };

  const login = async (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    await syncGuestStats();
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data);
    } catch {
      // keep the userData we already have
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshProfile = async () => {
    const res = await api.get("/auth/profile");
    setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile, syncGuestStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}