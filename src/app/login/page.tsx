"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useSettingsStore } from "@/lib/settingsStore";

const T = {
  ko: {
    title: "로그인",
    subtitle: "계정으로 로그인해 일정과 협업 공간을 이어서 관리해 보세요.",
    email: "이메일",
    password: "비밀번호",
    passwordPlaceholder: "비밀번호 입력",
    login: "로그인",
    loggingIn: "로그인 중...",
    or: "또는",
    guest: "게스트로 둘러보기",
    signupPrompt: "아직 계정이 없으신가요?",
    signup: "회원가입",
    emailRequired: "이메일과 비밀번호를 입력해 주세요.",
    fallbackError: "로그인에 실패했습니다.",
  },
  en: {
    title: "Log In",
    subtitle: "Log in to keep managing your schedule and collaboration spaces.",
    email: "Email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    login: "Log In",
    loggingIn: "Logging in...",
    or: "or",
    guest: "Continue as Guest",
    signupPrompt: "Don't have an account?",
    signup: "Sign Up",
    emailRequired: "Please enter your email and password.",
    fallbackError: "Login failed.",
  },
} as const;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginAsGuest } = useAuthStore();
  const { language } = useSettingsStore();
  const t = T[language];
  const next = searchParams.get("next") ?? "/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      setError(t.emailRequired);
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(email, password);
    if (result.success) {
      router.replace(next);
    } else {
      setError(result.error ?? t.fallbackError);
    }

    setLoading(false);
  };

  const handleGuest = () => {
    loginAsGuest();
    router.replace("/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-extrabold tracking-tight text-primary"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Weekedule
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Orchestrated Flow
          </p>
        </div>

        <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-7 shadow-ambient">
          <h2
            className="mb-1 text-xl font-extrabold text-on-surface"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {t.title}
          </h2>
          <p className="mb-6 text-xs text-on-surface-variant">{t.subtitle}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label-field">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="name@example.com"
                className="field"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label className="label-field">{t.password}</label>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder={t.passwordPlaceholder}
                className="field"
                autoComplete="current-password"
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-error/20 bg-error/5 px-3 py-2 text-xs text-error">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient mt-2 w-full rounded-full py-3 text-sm font-bold text-on-primary transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t.loggingIn : t.login}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="text-[11px] font-medium text-on-surface-variant/60">
              {t.or}
            </span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          <button
            type="button"
            onClick={handleGuest}
            className="w-full rounded-full border border-outline-variant/40 py-3 text-sm font-semibold text-on-surface-variant transition-all active:scale-95 hover:bg-surface-container/60"
          >
            {t.guest}
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-on-surface-variant">
          {t.signupPrompt}{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            {t.signup}
          </Link>
        </p>
      </div>
    </div>
  );
}
