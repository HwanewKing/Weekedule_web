"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsGuest } = useAuthStore();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const next = searchParams?.get("next") ?? "/home";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("이메일과 비밀번호를 입력해주세요"); return; }

    setLoading(true);
    setError("");

    const result = await login(email, password);
    if (result.success) {
      router.replace(next);
    } else {
      setError(result.error ?? "로그인에 실패했어요");
    }
    setLoading(false);
  };

  const handleGuest = () => {
    loginAsGuest();
    router.replace("/home");
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
          <h2
            className="text-xl font-extrabold text-on-surface mb-1"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            로그인
          </h2>
          <p className="text-xs text-on-surface-variant mb-6">계정에 로그인하세요</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label-field">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="name@example.com"
                className="field"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label className="label-field">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="비밀번호 입력"
                className="field"
                autoComplete="current-password"
              />
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
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="text-[11px] text-on-surface-variant/60 font-medium">또는</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          <button
            type="button"
            onClick={handleGuest}
            className="w-full py-3 rounded-full border border-outline-variant/40 text-sm font-semibold text-on-surface-variant hover:bg-surface-container/60 transition-all active:scale-95"
          >
            게스트로 시작
          </button>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-5">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
