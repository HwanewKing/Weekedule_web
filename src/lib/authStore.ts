"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

const GUEST_USER: AuthUser = { id: "guest", name: "게스트", email: "" };

interface AuthStore {
  user: AuthUser | null;
  isGuest: boolean;
  _hydrated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    language?: string
  ) => Promise<{ success: boolean; error?: string }>;
  fetchMe: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  loginAsGuest: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: false,
      _hydrated: false,

      login: async (email, password) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error };
        set({ user: data.user, isGuest: false });
        return { success: true };
      },

      logout: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        set({ user: null, isGuest: false });
      },

      register: async (name, email, password, language = "ko") => {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, language }),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error };
        set({ user: data.user, isGuest: false });

        try {
          const raw = localStorage.getItem("weekedule-guest-events");
          if (raw) {
            const guestEvents = JSON.parse(raw) as Array<Record<string, unknown>>;
            await Promise.all(
              guestEvents.map((event) =>
                fetch("/api/events", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: event.title,
                    description: event.description,
                    dayOfWeek: event.dayOfWeek,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    location: event.location,
                    categoryId: event.category,
                    groupId: event.groupId,
                  }),
                })
              )
            );
            localStorage.removeItem("weekedule-guest-events");
          }
        } catch {
          // Ignore guest-event migration failures after a successful sign-up.
        }

        return { success: true };
      },

      fetchMe: async () => {
        const { isGuest } = get();
        if (isGuest) {
          set({ _hydrated: true });
          return;
        }

        try {
          const res = await fetch("/api/auth/me");
          const data = await res.json();
          set({ user: data.user ?? null, _hydrated: true });
        } catch {
          set({ user: null, _hydrated: true });
        }
      },

      updateName: async (name) => {
        const { user } = get();
        if (!user) return;

        const res = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (res.ok) {
          set({ user: { ...user, name } });
        }
      },

      loginAsGuest: () => {
        set({ user: GUEST_USER, isGuest: true, _hydrated: true });
      },
    }),
    {
      name: "weekedule-auth",
      partialize: (state) => ({ user: state.user, isGuest: state.isGuest }),
    }
  )
);
