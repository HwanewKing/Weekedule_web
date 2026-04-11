"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthStore {
  user: AuthUser | null;
  _hydrated: boolean;

  /** 로그인. 성공 시 true, 실패 시 오류 메시지 반환 */
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;

  /** 로그아웃 */
  logout: () => Promise<void>;

  /** 회원가입 */
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;

  /** 서버에서 현재 세션 사용자 불러오기 */
  fetchMe: () => Promise<void>;

  /** 표시 이름 변경 */
  updateName: (name: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      _hydrated: false,

      login: async (email, password) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error };
        set({ user: data.user });
        return { success: true };
      },

      logout: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        set({ user: null });
      },

      register: async (name, email, password) => {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error };
        set({ user: data.user });
        return { success: true };
      },

      fetchMe: async () => {
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
    }),
    {
      name: "weekedule-auth",
      // 세션은 httpOnly 쿠키로 관리 — user 캐시만 저장
      partialize: (s) => ({ user: s.user }),
    }
  )
);
