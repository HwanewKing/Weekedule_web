"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // plain text (demo only — no backend yet)
  verified: boolean;
}

interface PendingVerification {
  name: string;
  email: string;
  password: string;
  code: string; // 6-digit code
}

interface AuthStore {
  user: AuthUser | null;
  users: StoredUser[];
  pending: PendingVerification | null;

  /** 로그인. 성공 시 true, 실패 시 오류 메시지 반환 */
  login: (email: string, password: string) => { success: boolean; error?: string };

  /** 로그아웃 */
  logout: () => void;

  /** 1단계: 회원정보 입력 → 인증 코드 생성 */
  initiateSignup: (
    name: string,
    email: string,
    password: string
  ) => { success: boolean; error?: string; code?: string };

  /** 2단계: 인증 코드 확인 → 회원 등록 완료 */
  verifyEmail: (code: string) => { success: boolean; error?: string };

  /** 이메일 중복 확인 */
  checkEmailExists: (email: string) => boolean;

  /** pending 초기화 */
  clearPending: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      users: [
        { id: "test-user-1", name: "테스트 유저",  email: "test@weekedule.app",  password: "test1234", verified: true },
        { id: "test-user-2", name: "김철수",       email: "chulsoo@weekedule.app", password: "test1234", verified: true },
        { id: "test-user-3", name: "이영희",       email: "younghee@weekedule.app", password: "test1234", verified: true },
      ],
      pending: null,

      login: (email, password) => {
        const found = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (!found) return { success: false, error: "이메일 또는 비밀번호가 올바르지 않아요" };
        if (!found.verified) return { success: false, error: "이메일 인증이 완료되지 않았어요" };
        if (found.password !== password) return { success: false, error: "이메일 또는 비밀번호가 올바르지 않아요" };

        set({ user: { id: found.id, name: found.name, email: found.email } });
        return { success: true };
      },

      logout: () => set({ user: null }),

      initiateSignup: (name, email, password) => {
        const exists = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (exists) return { success: false, error: "이미 사용 중인 이메일이에요" };

        const code = String(Math.floor(100000 + Math.random() * 900000));
        set({ pending: { name, email, password, code } });
        return { success: true, code };
      },

      verifyEmail: (code) => {
        const { pending } = get();
        if (!pending) return { success: false, error: "인증 정보가 없어요. 처음부터 다시 시도해주세요" };
        if (pending.code !== code) return { success: false, error: "인증 코드가 올바르지 않아요" };

        const newUser: StoredUser = {
          id: crypto.randomUUID(),
          name: pending.name,
          email: pending.email,
          password: pending.password,
          verified: true,
        };
        set((s) => ({ users: [...s.users, newUser], pending: null }));
        return { success: true };
      },

      checkEmailExists: (email) =>
        get().users.some((u) => u.email.toLowerCase() === email.toLowerCase()),

      clearPending: () => set({ pending: null }),
    }),
    {
      name: "weekedule-auth",
      version: 1,
      migrate: (stored: unknown) => {
        // v1: 시드 계정 3개를 항상 포함 보장
        const s = stored as { state?: { users?: StoredUser[]; user?: AuthUser | null; pending?: PendingVerification | null } };
        const existingUsers: StoredUser[] = s?.state?.users ?? [];
        const SEED_USERS: StoredUser[] = [
          { id: "test-user-1", name: "테스트 유저",  email: "test@weekedule.app",   password: "test1234", verified: true },
          { id: "test-user-2", name: "김철수",        email: "chulsoo@weekedule.app", password: "test1234", verified: true },
          { id: "test-user-3", name: "이영희",        email: "younghee@weekedule.app", password: "test1234", verified: true },
        ];
        // 시드 계정 없으면 추가
        const merged = [...SEED_USERS];
        for (const u of existingUsers) {
          if (!merged.find((m) => m.id === u.id)) merged.push(u);
        }
        return { ...s?.state, users: merged };
      },
    }
  )
);
