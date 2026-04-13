"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";
import { useSettingsStore } from "@/lib/settingsStore";

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;

const T = {
  ko: {
    title: "회원가입",
    subtitle: "기본 정보를 입력해주세요",
    labelName: "이름",
    placeholderName: "홍길동",
    labelEmail: "이메일",
    labelPassword: "비밀번호",
    placeholderPassword: "영문+숫자 혼합 8자 이상",
    labelPasswordConfirm: "비밀번호 확인",
    placeholderPasswordConfirm: "비밀번호 재입력",
    pwMismatch: "비밀번호가 일치하지 않아요",
    btnSubmit: "회원가입",
    btnLoading: "가입 중...",
    hasAccount: "이미 계정이 있으신가요?",
    login: "로그인",
    errName: "이름을 입력해주세요",
    errEmail: "이메일을 입력해주세요",
    errPassword: "비밀번호는 영문+숫자 혼합 8자 이상이어야 해요",
    errPwMatch: "비밀번호가 일치하지 않아요",
    errFallback: "회원가입에 실패했어요",
    pwChecks: [
      { label: "8자 이상", test: (p: string) => p.length >= 8 },
      { label: "영문 포함", test: (p: string) => /[a-zA-Z]/.test(p) },
      { label: "숫자 포함", test: (p: string) => /[0-9]/.test(p) },
    ],
  },
  en: {
    title: "Sign Up",
    subtitle: "Enter your basic information",
    labelName: "Name",
    placeholderName: "John Doe",
    labelEmail: "Email",
    labelPassword: "Password",
    placeholderPassword: "Letters + numbers, 8+ chars",
    labelPasswordConfirm: "Confirm Password",
    placeholderPasswordConfirm: "Re-enter password",
    pwMismatch: "Passwords do not match",
    btnSubmit: "Create Account",
    btnLoading: "Creating...",
    hasAccount: "Already have an account?",
    login: "Log in",
    errName: "Please enter your name",
    errEmail: "Please enter your email",
    errPassword: "Password must be 8+ chars with letters and numbers",
    errPwMatch: "Passwords do not match",
    errFallback: "Sign up failed",
    pwChecks: [
      { label: "8+ chars",  test: (p: string) => p.length >= 8 },
      { label: "Letter",    test: (p: string) => /[a-zA-Z]/.test(p) },
      { label: "Number",    test: (p: string) => /[0-9]/.test(p) },
    ],
  },
} as const;

type Lang = "ko" | "en";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const { setLanguage } = useSettingsStore();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/home";

  const [lang,     setLang]     = useState<Lang>("ko");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [pw2,      setPw2]      = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const t = T[lang];

  const switchLang = (l: Lang) => {
    setLang(l);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim())                   { setError(t.errName);     return; }
    if (!email)                         { setError(t.errEmail);    return; }
    if (!PASSWORD_REGEX.test(password)) { setError(t.errPassword); return; }
    if (password !== pw2)               { setError(t.errPwMatch);  return; }

    setLoading(true);
    const result = await register(name.trim(), email.toLowerCase().trim(), password, lang);
    if (result.success) {
      // 가입 시 선택한 언어를 settings에도 반영
      setLanguage(lang);
      router.replace(next);
    } else {
      setError(result.error ?? t.errFallback);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-extrabold text-primary tracking-tight"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Weekedule
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-medium tracking-wide uppercase">
            Orchestrated Flow
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-7 shadow-ambient border border-outline-variant/10">
          {/* 언어 토글 */}
          <div className="flex justify-end mb-5">
            <div className="flex bg-surface-container rounded-full p-0.5 gap-0.5">
              {(["ko", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => switchLang(l)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    lang === l
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {l === "ko" ? "한국어" : "English"}
                </button>
              ))}
            </div>
          </div>

          <h2
            className="text-xl font-extrabold text-on-surface mb-1"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {t.title}
          </h2>
          <p className="text-xs text-on-surface-variant mb-6">{t.subtitle}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label-field">{t.labelName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="name@example.com"
                className="field"
              />
            </div>

            <div>
              <label className="label-field">{t.labelPassword}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder={t.placeholderPassword}
                className="field"
                autoComplete="new-password"
              />
              {password && (
                <div className="flex gap-2 mt-2">
                  {t.pwChecks.map(({ label, test }) => {
                    const ok = test(password);
                    return (
                      <div key={label} className="flex items-center gap-1">
                        <span className={`text-[9px] font-bold ${ok ? "text-[#16a34a]" : "text-on-surface-variant/40"}`}>
                          {ok ? "✓" : "○"}
                        </span>
                        <span className={`text-[9px] ${ok ? "text-[#16a34a]" : "text-on-surface-variant/60"}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="label-field">{t.labelPasswordConfirm}</label>
              <input
                type="password"
                value={pw2}
                onChange={(e) => { setPw2(e.target.value); setError(""); }}
                placeholder={t.placeholderPasswordConfirm}
                className="field"
                autoComplete="new-password"
              />
              {pw2 && password !== pw2 && (
                <p className="text-[11px] mt-1.5 font-semibold text-error">{t.pwMismatch}</p>
              )}
            </div>

            {error && (
              <p className="text-xs text-error bg-error/5 border border-error/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full btn-gradient text-sm font-bold text-on-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 mt-2"
            >
              {loading ? t.btnLoading : t.btnSubmit}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-5">
          {t.hasAccount}{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
