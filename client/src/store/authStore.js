/**
 * authStore.js — Zustand store for authentication state
 *
 * Persisted to localStorage so the session survives page reloads.
 * Three actions:
 *   • setAuth(user)   — called after login
 *   • clearAuth()     — called on logout or token expiry
 *   • updateUser(data) — merges partial updates (e.g. profile edit)
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
      updateUser: (userData) =>
        set((state) => ({ user: { ...state.user, ...userData } })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
