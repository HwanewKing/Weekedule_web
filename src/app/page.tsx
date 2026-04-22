import type { Metadata } from "next";
import Link from "next/link";
import GuestStartButton from "@/components/marketing/GuestStartButton";
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
    title: "주간 뷰 중심 설계",
    body: "월·화·수·목·금 흐름을 한 화면에서 파악합니다. 날짜를 이리저리 이동하지 않아도 이번 주 일정 전체를 한눈에 볼 수 있습니다.",
  },
  {
    title: "룸으로 일정 공유",
    body: "가족이나 팀원을 룸에 초대해 서로의 시간표를 겹쳐볼 수 있습니다. 비어 있는 공통 시간대를 빠르게 찾을 때 유용합니다.",
  },
  {
    title: "게스트 모드로 바로 체험",
    body: "회원가입 없이도 핵심 기능을 먼저 써볼 수 있습니다. 마음에 들면 그때 계정을 만들어 데이터를 저장하면 됩니다.",
  },
];

const faq = [
  {
    question: "Weekedule은 어떤 사람에게 맞나요?",
    answer:
      "개인 주간 계획을 정리하고 싶은 사용자, 가족 캘린더를 함께 관리하는 가정, 회의 시간을 빠르게 정하고 싶은 소규모 팀에 잘 맞습니다.",
  },
  {
    question: "로그인 없이도 써볼 수 있나요?",
    answer:
      "네. 게스트 모드로 로그인 없이 주간 시간표를 직접 사용해볼 수 있습니다. 데이터를 저장하려면 계정을 만들면 됩니다.",
  },
  {
    question: "룸은 어떻게 사용하나요?",
    answer:
      "룸을 만들고 친구나 팀원을 초대하면 각자의 시간표가 한 화면에서 겹쳐 표시됩니다. 공통으로 비어 있는 시간대를 빠르게 찾을 수 있습니다.",
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
                Weekedule은 주간 일정을 한눈에 정리하고 가족·팀원과 쉽게
                공유할 수 있는 일정 관리 앱입니다. 일정 정리, 가족 캘린더,
                팀 협업 루틴에 관한 실용적인 가이드도 함께 제공합니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                >
                  무료로 시작
                </Link>
                <GuestStartButton
                  className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-slate-400 hover:bg-white/70"
                />
                <Link
                  href="/guides"
                  className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-900"
                >
                  가이드 둘러보기
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
                <span>무료로 이용 가능</span>
                <span>회원가입 없이 체험</span>
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
                      개인·가족·팀 일정을 하나의 앱으로
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      시간표 공유, 겹치는 시간대 찾기, 주간 루틴 관리까지
                      하나의 앱에서 간단하게 해결할 수 있습니다.
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

        <section className="bg-slate-50">
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
                  일정 관리에 도움이 되는 실용 가이드
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
                  className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {article.category}
                    </span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3
                    className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    <Link href={`/guides/${article.slug}`}>{article.title}</Link>
                  </h3>
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
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1fr,1fr] lg:px-8">
          <article className="flex flex-col justify-between rounded-[2rem] bg-slate-950 p-8 text-white">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-sky-300">
                Get Started
              </p>
              <h2
                className="mt-4 text-3xl font-extrabold tracking-tight"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                지금 바로
                <br />
                시작해보세요
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                계정 없이 게스트 모드로 먼저 써보고, 마음에 들면 무료로
                가입하세요. 주간 시간표부터 룸 공유까지 모두 무료입니다.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5"
              >
                무료로 시작
              </Link>
              <GuestStartButton className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10" />
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 p-8">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
              FAQ
            </p>
            <div className="mt-6 space-y-5">
              {faq.map((item) => (
                <div key={item.question} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <h2 className="text-base font-bold text-slate-950">
                    {item.question}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
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
