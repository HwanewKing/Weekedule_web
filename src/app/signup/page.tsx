"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useSettingsStore } from "@/lib/settingsStore";

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;

const T = {
  ko: {
    title: "회원가입",
    subtitle: "기본 정보를 입력하고 Weekedule 계정을 만들어 보세요.",
    labelName: "이름",
    placeholderName: "홍길동",
    labelEmail: "이메일",
    labelPassword: "비밀번호",
    placeholderPassword: "영문과 숫자를 포함해 8자 이상",
    labelPasswordConfirm: "비밀번호 확인",
    placeholderPasswordConfirm: "비밀번호를 한 번 더 입력해 주세요.",
    pwMismatch: "비밀번호가 서로 일치하지 않습니다.",
    btnSubmit: "회원가입",
    btnLoading: "가입 중...",
    hasAccount: "이미 계정이 있으신가요?",
    login: "로그인",
    errName: "이름을 입력해 주세요.",
    errEmail: "이메일을 입력해 주세요.",
    errPassword: "비밀번호는 영문과 숫자를 포함해 8자 이상이어야 합니다.",
    errPwMatch: "비밀번호가 서로 일치하지 않습니다.",
    errFallback: "회원가입에 실패했습니다.",
    pwChecks: [
      { label: "8자 이상", test: (p: string) => p.length >= 8 },
      { label: "영문 포함", test: (p: string) => /[a-zA-Z]/.test(p) },
      { label: "숫자 포함", test: (p: string) => /[0-9]/.test(p) },
    ],
  },
  en: {
    title: "Sign Up",
    subtitle: "Enter your information to create a Weekedule account.",
    labelName: "Name",
    placeholderName: "John Doe",
    labelEmail: "Email",
    labelPassword: "Password",
    placeholderPassword: "Letters + numbers, 8+ characters",
    labelPasswordConfirm: "Confirm Password",
    placeholderPasswordConfirm: "Re-enter your password",
    pwMismatch: "Passwords do not match.",
    btnSubmit: "Create Account",
    btnLoading: "Creating...",
    hasAccount: "Already have an account?",
    login: "Log In",
    errName: "Please enter your name.",
    errEmail: "Please enter your email.",
    errPassword: "Password must be at least 8 characters with letters and numbers.",
    errPwMatch: "Passwords do not match.",
    errFallback: "Sign up failed.",
    pwChecks: [
      { label: "8+ chars", test: (p: string) => p.length >= 8 },
      { label: "Letter", test: (p: string) => /[a-zA-Z]/.test(p) },
      { label: "Number", test: (p: string) => /[0-9]/.test(p) },
    ],
  },
} as const;

type Lang = "ko" | "en";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuthStore();
  const { setLanguage } = useSettingsStore();
  const next = searchParams.get("next") ?? "/home";

  const [lang, setLang] = useState<Lang>("ko");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const t = T[lang];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(t.errName);
      return;
    }
    if (!email) {
      setError(t.errEmail);
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError(t.errPassword);
      return;
    }
    if (password !== passwordConfirm) {
      setError(t.errPwMatch);
      return;
    }

    setLoading(true);
    const result = await register(name.trim(), email.toLowerCase().trim(), password, lang);

    if (result.success) {
      setLanguage(lang);
      router.replace(next);
    } else {
      setError(result.error ?? t.errFallback);
    }

    setLoading(false);
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
          <div className="mb-5 flex justify-end">
            <div className="flex gap-0.5 rounded-full bg-surface-container p-0.5">
              {(["ko", "en"] as Lang[]).map((nextLang) => (
                <button
                  key={nextLang}
                  type="button"
                  onClick={() => {
                    setLang(nextLang);
                    setError("");
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    lang === nextLang
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {nextLang === "ko" ? "한국어" : "English"}
                </button>
              ))}
            </div>
          </div>

          <h2
            className="mb-1 text-xl font-extrabold text-on-surface"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {t.title}
          </h2>
          <p className="mb-6 text-xs text-on-surface-variant">{t.subtitle}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label-field">{t.labelName}</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t.placeholderName}
                className="field"
                autoFocus
              />
            </div>

            <div>
              <label className="label-field">{t.labelEmail}</label>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="name@example.com"
                className="field"
              />
            </div>

            <div>
              <label className="label-field">{t.labelPassword}</label>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder={t.placeholderPassword}
                className="field"
                autoComplete="new-password"
              />
              {password ? (
                <div className="mt-2 flex gap-2">
                  {t.pwChecks.map(({ label, test }) => {
                    const ok = test(password);
                    return (
                      <div key={label} className="flex items-center gap-1">
                        <span
                          className={`text-[9px] font-bold ${
                            ok ? "text-[#16a34a]" : "text-on-surface-variant/40"
                          }`}
                        >
                          {ok ? "OK" : "NO"}
                        </span>
                        <span
                          className={`text-[9px] ${
                            ok ? "text-[#16a34a]" : "text-on-surface-variant/60"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div>
              <label className="label-field">{t.labelPasswordConfirm}</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(event) => {
                  setPasswordConfirm(event.target.value);
                  setError("");
                }}
                placeholder={t.placeholderPasswordConfirm}
                className="field"
                autoComplete="new-password"
              />
              {passwordConfirm && password !== passwordConfirm ? (
                <p className="mt-1.5 text-[11px] font-semibold text-error">
                  {t.pwMismatch}
                </p>
              ) : null}
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
              {loading ? t.btnLoading : t.btnSubmit}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-on-surface-variant">
          {t.hasAccount}{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
