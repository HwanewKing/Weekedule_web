import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { guideArticles } from "@/lib/siteContent";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "가이드",
  description:
    "주간 계획, 가족 캘린더, 팀 일정 공유, 공부 루틴에 관한 실용적인 가이드를 제공합니다.",
  alternates: {
    canonical: absoluteUrl("/guides"),
  },
};

export default function GuidesPage() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#082f49,#0f172a)] p-8 text-white sm:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">
                Guides
              </p>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                {guideArticles.length}개
              </span>
            </div>
            <h1
              className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              일정 관리,
              <br />
              지금보다 잘할 수 있습니다
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              주간 계획 구조 잡기, 가족 일정 공유, 팀 회의 시간 조율까지 —
              실제 상황에서 바로 써볼 수 있는 가이드를 모았습니다.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              전체 <span className="font-bold text-slate-700">{guideArticles.length}</span>개
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {guideArticles.map((article) => (
              <article
                key={article.slug}
                className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {article.category}
                  </span>
                  <span>{article.readTime}</span>
                </div>
                <h2
                  className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  <Link href={`/guides/${article.slug}`}>{article.title}</Link>
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {article.excerpt}
                </p>
                <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                  <span>업데이트 {article.updatedAt}</span>
                  <Link
                    href={`/guides/${article.slug}`}
                    className="font-bold text-slate-900"
                  >
                    읽어보기
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
