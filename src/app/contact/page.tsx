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
    body: "로그인 가능한 사용자라면 앱 내부의 문의하기 메뉴를 통해 오류, 제안, 사용 문의를 보낼 수 있습니다.",
  },
  {
    title: "콘텐츠 관련 문의",
    body: "가이드 내용의 수정 제안이나 사실 확인 요청은 문의 페이지를 통해 접수하며, 확인 가능한 내용은 순차적으로 반영합니다.",
  },
  {
    title: "광고 및 파트너십",
    body: "광고 문의는 사용자 경험을 해치지 않는 범위에서만 검토합니다. 심사 또는 클릭을 유도하는 성격의 요청은 받지 않습니다.",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-700">
            Contact
          </p>
          <h1
            className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            서비스와 콘텐츠에 관한 문의 안내
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Weekedule은 사용자 경험과 콘텐츠 신뢰를 해치지 않는 범위에서 문의를
            받습니다. 현재 가장 빠른 사용자 문의 채널은 서비스 내부 문의하기
            메뉴입니다.
          </p>
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

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr,1fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-8">
            <h2
              className="text-2xl font-extrabold text-slate-950"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              응답 원칙
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                문의 내용이 제품 개선, 오류 수정, 콘텐츠 정확성 향상에 직접
                연결되는 경우 우선적으로 검토합니다.
              </p>
              <p>
                개인정보, 계정 보안, 부정 클릭 유도, 정책 위반 요청과 관련된
                문의는 처리하지 않거나 제한될 수 있습니다.
              </p>
              <p>
                공개 콘텐츠의 정정 요청은 확인 가능한 근거가 있는 경우에만
                반영합니다.
              </p>
            </div>
          </article>

          <aside className="rounded-[2rem] bg-[linear-gradient(180deg,#0f172a,#111827)] p-8 text-slate-200">
            <h2
              className="text-2xl font-extrabold text-white"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              바로 시작하기
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Weekedule을 직접 사용해 보고 싶다면 계정을 만든 뒤 일정, 공유
              링크, 문의하기 기능을 확인해 보세요. 회원가입 전에 게스트 모드로
              먼저 체험해 볼 수도 있습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950"
              >
                회원가입
              </Link>
              <Link
                href="/guides"
                className="inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white"
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
