"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";

type Step = "info" | "verify";

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;

function PasswordStrength({ password }: { password: string }) {
  const hasLength  = password.length >= 8;
  const hasLetter  = /[a-zA-Z]/.test(password);
  const hasNumber  = /[0-9]/.test(password);

  const checks = [
    { label: "8자 이상", ok: hasLength },
    { label: "영문 포함", ok: hasLetter },
    { label: "숫자 포함", ok: hasNumber },
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
  const { initiateSignup, verifyEmail, checkEmailExists } = useAuthStore();

  const [step, setStep] = useState<Step>("info");

  // Step 1 fields
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [pw2,      setPw2]      = useState("");

  // Email check state
  const [emailChecked,   setEmailChecked]   = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);

  // Step 2 fields
  const [code,      setCode]      = useState("");
  const [demoCode,  setDemoCode]  = useState("");

  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailCheck = () => {
    if (!email) { setError("이메일을 입력해주세요"); return; }
    const exists = checkEmailExists(email);
    setEmailChecked(true);
    setEmailAvailable(!exists);
    setError("");
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim())         { setError("이름을 입력해주세요"); return; }
    if (!emailChecked)        { setError("이메일 중복 확인을 해주세요"); return; }
    if (!emailAvailable)      { setError("이미 사용 중인 이메일이에요"); return; }
    if (!PASSWORD_REGEX.test(password)) { setError("비밀번호는 영문+숫자 혼합 8자 이상이어야 해요"); return; }
    if (password !== pw2)     { setError("비밀번호가 일치하지 않아요"); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const result = initiateSignup(name.trim(), email.toLowerCase().trim(), password);
    if (result.success && result.code) {
      setDemoCode(result.code);
      setStep("verify");
    } else {
      setError(result.error ?? "오류가 발생했어요");
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) { setError("6자리 코드를 입력해주세요"); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const result = verifyEmail(code);
    if (result.success) {
      router.replace("/login");
    } else {
      setError(result.error ?? "인증에 실패했어요");
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
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-5">
            <div className={`w-2 h-2 rounded-full ${step === "info" ? "bg-primary" : "bg-[#16a34a]"}`} />
            <div className="flex-1 h-px bg-outline-variant/30" />
            <div className={`w-2 h-2 rounded-full ${step === "verify" ? "bg-primary" : "bg-outline-variant/30"}`} />
          </div>

          {step === "info" ? (
            <>
              <h2
                className="text-xl font-extrabold text-on-surface mb-1"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                회원가입
              </h2>
              <p className="text-xs text-on-surface-variant mb-6">기본 정보를 입력해주세요</p>

              <form onSubmit={handleSendVerification} className="flex flex-col gap-4">
                {/* 이름 */}
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

                {/* 이메일 + 중복 확인 */}
                <div>
                  <label className="label-field">이메일</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailChecked(false);
                        setEmailAvailable(false);
                        setError("");
                      }}
                      placeholder="name@example.com"
                      className="field flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleEmailCheck}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
                    >
                      중복확인
                    </button>
                  </div>
                  {emailChecked && (
                    <p className={`text-[11px] mt-1.5 font-semibold ${emailAvailable ? "text-[#16a34a]" : "text-error"}`}>
                      {emailAvailable ? "✓ 사용 가능한 이메일이에요" : "✗ 이미 사용 중인 이메일이에요"}
                    </p>
                  )}
                </div>

                {/* 비밀번호 */}
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

                {/* 비밀번호 확인 */}
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
                  {loading ? "처리 중..." : "인증 메일 보내기"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2
                className="text-xl font-extrabold text-on-surface mb-1"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                이메일 인증
              </h2>
              <p className="text-xs text-on-surface-variant mb-5">
                <span className="font-semibold text-on-surface">{email}</span>로 인증 코드를 발송했어요
              </p>

              {/* 데모 안내 */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 mb-5">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Demo Mode</p>
                <p className="text-xs text-on-surface-variant">
                  실제 이메일 대신 인증 코드를 여기서 확인하세요
                </p>
                <p className="text-2xl font-extrabold text-primary mt-2 tracking-[0.3em]"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {demoCode}
                </p>
              </div>

              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <div>
                  <label className="label-field">인증 코드 (6자리)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setCode(v);
                      setError("");
                    }}
                    placeholder="123456"
                    className="field text-center text-xl font-bold tracking-widest"
                    autoFocus
                    maxLength={6}
                  />
                </div>

                {error && (
                  <p className="text-xs text-error bg-error/5 border border-error/20 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full py-3 rounded-full btn-gradient text-sm font-bold text-on-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {loading ? "인증 중..." : "인증 완료"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("info"); setCode(""); setError(""); }}
                  className="text-xs text-on-surface-variant hover:text-primary transition-colors text-center"
                >
                  ← 정보 수정하기
                </button>
              </form>
            </>
          )}
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
