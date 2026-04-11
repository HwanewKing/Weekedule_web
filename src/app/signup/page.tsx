"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8자 이상", ok: password.length >= 8 },
    { label: "영문 포함", ok: /[a-zA-Z]/.test(password) },
    { label: "숫자 포함", ok: /[0-9]/.test(password) },
  ];
  return (
    <div className="flex gap-2 mt-2">
      {checks.map(({ label, ok }) => (
        <div key={label} className="flex items-center gap-1">
          <span className={`text-[9px] font-bold ${ok ? "text-[#16a34a]" : "text-on-surface-variant/40"}`}>
            {ok ? "✓" : "○"}
          </span>
          <span className={`text-[9px] ${ok ? "text-[#16a34a]" : "text-on-surface-variant/60"}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuthStore();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [pw2,      setPw2]      = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim())                      { setError("이름을 입력해주세요"); return; }
    if (!email)                            { setError("이메일을 입력해주세요"); return; }
    if (!PASSWORD_REGEX.test(password))    { setError("비밀번호는 영문+숫자 혼합 8자 이상이어야 해요"); return; }
    if (password !== pw2)                  { setError("비밀번호가 일치하지 않아요"); return; }

    setLoading(true);
    const result = await register(name.trim(), email.toLowerCase().trim(), password);
    if (result.success) {
      router.replace("/");
    } else {
      setError(result.error ?? "회원가입에 실패했어요");
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-sm">
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
            회원가입
          </h2>
          <p className="text-xs text-on-surface-variant mb-6">기본 정보를 입력해주세요</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label-field">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="field"
                autoFocus
              />
            </div>

            <div>
              <label className="label-field">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="name@example.com"
                className="field"
              />
            </div>

            <div>
              <label className="label-field">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="영문+숫자 혼합 8자 이상"
                className="field"
                autoComplete="new-password"
              />
              {password && <PasswordStrength password={password} />}
            </div>

            <div>
              <label className="label-field">비밀번호 확인</label>
              <input
                type="password"
                value={pw2}
                onChange={(e) => { setPw2(e.target.value); setError(""); }}
                placeholder="비밀번호 재입력"
                className="field"
                autoComplete="new-password"
              />
              {pw2 && password !== pw2 && (
                <p className="text-[11px] mt-1.5 font-semibold text-error">비밀번호가 일치하지 않아요</p>
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
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-5">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
