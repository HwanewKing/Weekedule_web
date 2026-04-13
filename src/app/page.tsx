"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";

export default function LandingPage() {
  const router = useRouter();
  const { loginAsGuest } = useAuthStore();

  const handleGuest = () => {
    loginAsGuest();
    router.replace("/home");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0d0d0f", color: "#f1f1f3" }}>
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "var(--font-manrope)", color: "#f1f1f3" }}>
            Weekedule
          </span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/30 hidden sm:block">
            Orchestrated Flow
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-sm font-semibold text-white/70 hover:text-white transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-full text-sm font-bold text-white btn-gradient active:scale-95 transition-all"
          >
            무료 시작
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white/60 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4868f1]" />
          로그인 없이 바로 체험 가능
        </div>

        {/* Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          주간 일정을 만들고
          <br />
          <span style={{ background: "linear-gradient(135deg, #4868f1, #7c9fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            링크로 팀과 공유하세요
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/50 max-w-md mb-10 leading-relaxed">
          나의 시간표를 그리고, 초대 링크를 보내면 끝.
          <br />
          모두의 일정이 겹치는 시간을 자동으로 찾아드립니다.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleGuest}
            className="px-7 py-3.5 rounded-full text-sm font-bold text-white btn-gradient active:scale-95 transition-all flex items-center gap-2"
          >
            먼저 체험하기 →
          </button>
          <Link
            href="/signup"
            className="px-7 py-3.5 rounded-full text-sm font-semibold border border-white/20 text-white/80 hover:bg-white/5 transition-all"
          >
            무료 계정 만들기
          </Link>
        </div>
      </main>

      {/* Feature cards */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              ),
              title: "주간 시간표",
              desc: "드래그로 쉽게 일정을 추가하고 색상 카테고리로 정리하세요.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              ),
              title: "링크로 공유",
              desc: "초대 링크 하나로 계정 없이도 팀원이 참여할 수 있습니다.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              ),
              title: "겹치는 시간 탐색",
              desc: "히트맵으로 모두가 가능한 시간대를 한눈에 파악하세요.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#252530", color: "#8899ff" }}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-bold text-white/90 mb-1">{title}</p>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-white/25">© 2026 Weekedule. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="text-xs text-white/25 cursor-default">개인정보처리방침</span>
          <span className="text-xs text-white/25 cursor-default">이용약관</span>
        </div>
      </footer>
    </div>
  );
}
