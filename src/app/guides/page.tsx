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
        <section className="rounded-[2rem] bg-[linear-gradient(180deg,#082f49,#0f172a)] p-8 text-white sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">
            Resource Library
          </p>
          <h1
            className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            일정 관리와 생활 루틴을 더 잘 운영하기 위한 실전 가이드
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Weekedule은 앱 기능 소개에 그치지 않고, 실제로 도움이 되는 일정
            관리 콘텐츠를 함께 제공합니다. 모든 문서는 공개적으로 읽을 수 있고
            발행일과 수정일을 명시합니다.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
