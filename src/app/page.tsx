import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { absoluteUrl } from "@/lib/site";
import { featuredGuideSlugs, guideArticles } from "@/lib/siteContent";

export const metadata: Metadata = {
  title: "주간 일정과 공유 캘린더를 더 명확하게",
  description:
    "Weekedule은 주간 계획, 가족 일정, 팀 회의 시간 조율을 더 쉽게 만드는 일정 관리 서비스이자 정보형 가이드 사이트입니다.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

const highlights = [
  {
    title: "읽을 가치가 있는 공개 콘텐츠",
    body: "로그인 없이 읽을 수 있는 가이드와 정책 페이지를 함께 제공해 사이트 신뢰도와 탐색성을 높였습니다.",
  },
  {
    title: "주간 화면 중심의 일정 경험",
    body: "개인 계획, 가족 일정, 팀 공유 일정을 주간 단위로 파악하기 쉬운 구조를 지향합니다.",
  },
  {
    title: "정책 친화적인 운영 구조",
    body: "명확한 소개, 정책 페이지, 사이트맵, 로봇 파일, 광고 기본 비활성화 전략으로 심사 친화성을 높였습니다.",
  },
];

const faq = [
  {
    question: "Weekedule은 어떤 사람에게 맞나요?",
    answer:
      "개인 주간 계획을 정리하고 싶은 사용자, 가족 캘린더를 함께 관리하는 가정, 회의 시간을 빠르게 정하고 싶은 소규모 팀에 잘 맞습니다.",
  },
  {
    question: "로그인하지 않아도 볼 수 있는 정보가 있나요?",
    answer:
      "네. 메인 페이지, 가이드, 소개, 문의, 개인정보처리방침, 이용약관, 운영 원칙 페이지는 모두 공개되어 있습니다.",
  },
  {
    question: "광고가 바로 보이나요?",
    answer:
      "승인 전에는 광고 스크립트를 기본 비활성화해 두고, 승인 후 환경 설정으로만 켤 수 있도록 구성했습니다.",
  },
];

const featuredArticles = guideArticles.filter((article) =>
  featuredGuideSlugs.includes(article.slug as (typeof featuredGuideSlugs)[number])
);

export default function HomePage() {
  return (
    <div className="bg-white text-slate-900">
      <SiteHeader />

      <main>
        <section className="overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_30%),radial-gradient(circle_at_bottom_right,#ccfbf1,transparent_26%),linear-gradient(180deg,#ffffff,#f8fafc)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-6 lg:grid-cols-[1.1fr,0.9fr] lg:px-8 lg:py-28">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-sky-700">
                Weekly Planning Platform
              </p>
              <h1
                className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-6xl"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                주간 일정과 공유 캘린더를
                <br />
                더 선명하게 정리하는 방법
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Weekedule은 개인 일정 관리 앱이면서 동시에 일정 정리, 가족
                캘린더, 팀 협업 루틴에 관한 실용적인 가이드를 제공하는 정보형
                사이트입니다. 광고보다 먼저 콘텐츠와 사용자 경험을 우선하는
                구조로 설계했습니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                >
                  무료로 시작
                </Link>
                <Link
                  href="/guides"
                  className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-900"
                >
                  가이드 둘러보기
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
                <span>공개 정보 페이지 제공</span>
                <span>정책 페이지 정리</span>
                <span>주간 중심 일정 경험</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-8 h-24 w-24 rounded-full bg-sky-200/70 blur-3xl" />
              <div className="absolute bottom-8 right-0 h-24 w-24 rounded-full bg-emerald-200/70 blur-3xl" />
              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_100px_rgba(15,23,42,0.12)]">
                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-300">
                      This Week
                    </p>
                    <p
                      className="mt-3 text-2xl font-extrabold"
                      style={{ fontFamily: "var(--font-manrope)" }}
                    >
                      일정 충돌과 빈 시간을
                      <br />
                      한눈에 파악
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] bg-sky-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                        Family
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        등하원, 병원, 외출 같은 가족 일정을 주간 흐름으로 관리
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] bg-emerald-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                        Team
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        팀원 겹침 시간을 찾고 회의 후보를 빠르게 비교
                      </p>
                    </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 p-5">
                    <p className="text-sm font-bold text-slate-900">
                      공개 콘텐츠와 서비스가 함께 있는 구조
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      소개 페이지, 정책 페이지, 가이드 허브, 상세 글, 사이트맵,
                      robots 파일까지 검색엔진 친화적으로 구성했습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((highlight) => (
              <article
                key={highlight.title}
                className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6"
              >
                <h2
                  className="text-2xl font-extrabold text-slate-950"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {highlight.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {highlight.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-sky-700">
                  Featured Guides
                </p>
                <h2
                  className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  사이트 품질을 받쳐주는 공개 가이드 콘텐츠
                </h2>
              </div>
              <Link
                href="/guides"
                className="hidden text-sm font-bold text-slate-900 md:inline-flex"
              >
                전체 가이드 보기
              </Link>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <article
                  key={article.slug}
                  className="rounded-[1.75rem] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                    {article.category}
                  </p>
                  <h3
                    className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    <Link href={`/guides/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {article.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                    <span>{article.readTime}</span>
                    <Link
                      href={`/guides/${article.slug}`}
                      className="font-bold text-slate-950"
                    >
                      읽기
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1fr,1fr] lg:px-8">
          <article className="rounded-[2rem] border border-slate-200 p-8">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-700">
              Trust Signals
            </p>
            <h2
              className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              심사 친화성을 높이는 기본 요소
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <p>공개 홈, 소개, 문의, 정책, 가이드 허브, 상세 콘텐츠 제공</p>
              <p>검색엔진을 위한 메타데이터, robots, sitemap, canonical 설정</p>
              <p>광고 스크립트는 기본 비활성화 후 승인 뒤 환경변수로만 활성화</p>
              <p>로그인 없이 접근 가능한 의미 있는 정보 페이지를 충분히 확보</p>
            </div>
          </article>

          <article className="rounded-[2rem] bg-slate-950 p-8 text-slate-200">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">
              FAQ
            </p>
            <div className="mt-6 space-y-5">
              {faq.map((item) => (
                <div key={item.question} className="rounded-2xl bg-white/5 p-5">
                  <h2 className="text-base font-bold text-white">
                    {item.question}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
