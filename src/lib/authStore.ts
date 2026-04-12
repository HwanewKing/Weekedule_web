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

  /** 로그인. 성공 시 true, 실패 시 오류 메시지 반환 */
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;

  /** 로그아웃 */
  logout: () => Promise<void>;

  /** 회원가입 */
  register: (
    name: string,
    email: string,
    password: string,
    language?: string
  ) => Promise<{ success: boolean; error?: string }>;

  /** 서버에서 현재 세션 사용자 불러오기 */
  fetchMe: () => Promise<void>;

  /** 표시 이름 변경 */
  updateName: (name: string) => Promise<void>;

  /** 게스트로 시작 */
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

        // 게스트 이벤트를 DB로 마이그레이션
        try {
          const raw = localStorage.getItem("weekedule-guest-events");
          if (raw) {
            const guestEvents = JSON.parse(raw) as Array<Record<string, unknown>>;
            await Promise.all(
              guestEvents.map((e) =>
                fetch("/api/events", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    title: e.title,
                    description: e.description,
                    dayOfWeek: e.dayOfWeek,
                    startTime: e.startTime,
                    endTime: e.endTime,
                    location: e.location,
                    categoryId: e.category,
                    groupId: e.groupId,
                  }),
                })
              )
            );
            localStorage.removeItem("weekedule-guest-events");
          }
        } catch {
          // 마이그레이션 실패는 무시 (로그인은 성공)
        }

        return { success: true };
      },

      fetchMe: async () => {
        const { isGuest } = get();
        if (isGuest) {
          set({ _hydrated: true });
          return;
        }
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        set({ user: data.user ?? null, _hydrated: true });
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
      partialize: (s) => ({ user: s.user, isGuest: s.isGuest }),
    }
  )
);
