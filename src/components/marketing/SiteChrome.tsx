import Link from "next/link";
import GuestStartButton from "./GuestStartButton";

const primaryLinks = [
  { href: "/guides", label: "가이드" },
  { href: "/about", label: "서비스 소개" },
  { href: "/contact", label: "문의" },
];

const legalLinks = [
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/terms", label: "이용약관" },
  { href: "/editorial-policy", label: "운영 원칙" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#0f766e)] text-sm font-black text-white shadow-lg shadow-sky-200/60">
            W
          </div>
          <div>
            <p
              className="text-lg font-extrabold tracking-tight text-slate-900"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Weekedule
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">
              일정 관리와 생활 루틴을 돕는 주간 계획 서비스
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950 sm:px-4 sm:py-2 sm:text-sm"
          >
            로그인
          </Link>
          <GuestStartButton
            className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950 lg:inline-flex"
          />
          <Link
            href="/signup"
            className="inline-flex rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 sm:px-4 sm:py-2 sm:text-sm"
          >
            무료로 시작
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-200/70 md:hidden">
        <nav className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-5 py-2.5 sm:px-6">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.4fr,1fr,1fr] lg:px-8">
        <div className="space-y-4">
          <div>
            <p
              className="text-lg font-extrabold text-white"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Weekedule
            </p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
              Weekedule is a planning product and editorial site focused on
              healthier weekly routines, clearer shared calendars, and more
              practical scheduling habits.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 Weekedule. All rights reserved.
          </p>
        </div>

        <div>
          <p className="mb-4 text-sm font-bold text-white">둘러보기</p>
          <div className="flex flex-col gap-3">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-bold text-white">정책과 신뢰</p>
          <div className="flex flex-col gap-3">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
