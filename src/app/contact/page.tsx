import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "문의",
  description:
    "Weekedule 서비스와 콘텐츠 운영에 관한 문의 방법과 응답 원칙을 안내합니다.",
  alternates: {
    canonical: absoluteUrl("/contact"),
  },
};

const contactCards = [
  {
    title: "서비스 사용 문의",
    body: "로그인한 사용자라면 앱 내부의 문의하기 메뉴를 통해 오류 신고, 기능 제안, 사용 관련 질문을 보낼 수 있습니다.",
  },
  {
    title: "콘텐츠 관련 문의",
    body: "가이드 내용의 수정 제안이나 사실 확인 요청은 문의 페이지를 통해 접수하며, 확인 가능한 내용은 순차적으로 반영합니다.",
  },
  {
    title: "파트너십 및 제휴",
    body: "서비스 방향에 맞는 파트너십이나 콘텐츠 협업 제안은 검토 후 순차적으로 답변 드립니다.",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-12">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-700">
              Contact
            </p>
            <h1
              className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              궁금한 점이 있으신가요?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              서비스 이용 중 불편한 점, 가이드 내용 관련 제안, 협업 문의 등
              아래 채널을 통해 보내주세요. 현재 가장 빠른 응답은 앱 내부
              문의하기 메뉴를 통해 받을 수 있습니다.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {contactCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6"
            >
              <h2
                className="text-xl font-extrabold text-slate-950"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                {card.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {card.body}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-8">
            <h2
              className="text-2xl font-extrabold text-slate-950"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              응답 원칙
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                제품 개선, 오류 수정, 콘텐츠 정확성 향상에 직접 연결되는
                문의를 우선적으로 검토합니다.
              </p>
              <p>
                계정 보안이나 개인정보 관련 사항은 내부 처리 원칙에 따라
                응답이 제한될 수 있습니다.
              </p>
              <p>
                공개 콘텐츠의 정정 요청은 확인 가능한 근거가 있는 경우에만
                반영합니다.
              </p>
            </div>
          </article>

          <aside className="rounded-[2rem] bg-slate-950 p-8 text-slate-200">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-sky-300">
              Get Started
            </p>
            <h2
              className="mt-4 text-2xl font-extrabold text-white"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              직접 써보세요
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              계정 없이 게스트 모드로 먼저 체험해 보고, 마음에 들면 가입해서
              일정을 저장하고 공유해 보세요.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5"
              >
                무료로 시작
              </Link>
              <Link
                href="/guides"
                className="inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                가이드 보기
              </Link>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
