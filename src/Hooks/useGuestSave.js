import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export const GUEST_STATS_KEY = "guestGameStats";

export function readGuestStats() {
  try {
    const raw = localStorage.getItem(GUEST_STATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeGuestStats(stats) {
  localStorage.setItem(GUEST_STATS_KEY, JSON.stringify(stats));
}

export function clearGuestStats() {
  localStorage.removeItem(GUEST_STATS_KEY);
}

export function hasGuestStats() {
  return Object.keys(readGuestStats()).length > 0;
}

function mergeStat(existing = {}, payload) {
  const merged = { ...existing, ...payload };
  if (payload.highScore != null) {
    merged.highScore = Math.max(existing.highScore || 0, payload.highScore);
  }
  if (payload.progress != null) {
    merged.progress = Math.max(existing.progress || 0, payload.progress);
  }
  if (payload.bestTime != null) {
    merged.bestTime = existing.bestTime ? Math.min(existing.bestTime, payload.bestTime) : payload.bestTime;
  }
  return merged;
}

/**
 * Drop-in replacement for the old `api.put("/auth/profile/stats", payload)` calls
 * in each game page. Logged-in users still hit the API; guests get their
 * progress merged into localStorage instead, ready to sync after they sign up.
 */
export function useGuestSave() {
  const { user } = useAuth();

  const saveStats = useCallback(
    async (payload) => {
      if (user) {
        return api.put("/auth/profile/stats", payload);
      }
      const stats = readGuestStats();
      stats[payload.game] = mergeStat(stats[payload.game], payload);
      writeGuestStats(stats);
      return null;
    },
    [user]
  );

  return { saveStats, isGuest: !user };
}
