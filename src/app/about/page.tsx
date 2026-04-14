import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "서비스 소개",
  description:
    "Weekedule이 어떤 문제를 해결하고 어떤 기준으로 서비스를 운영하는지 소개합니다.",
  alternates: {
    canonical: absoluteUrl("/about"),
  },
};

const principles = [
  {
    title: "실제 생활에서 쓰이는 일정 관리",
    body: "Weekedule은 화려한 기능보다 실제로 한 주를 정리할 때 도움이 되는 구조를 우선합니다. 개인 일정, 가족 일정, 팀 일정처럼 현실적인 사용 장면을 기준으로 서비스를 설계합니다.",
  },
  {
    title: "공유와 충돌 확인에 강한 주간 화면",
    body: "모두가 비어 있는 시간을 찾거나 일정을 겹쳐 보는 작업은 여전히 번거롭습니다. Weekedule은 이 과정을 더 빠르게 만들기 위해 주간 중심의 시각화와 단순한 공유 흐름에 집중합니다.",
  },
  {
    title: "읽을 가치가 있는 정보 제공",
    body: "서비스 소개 페이지뿐 아니라 일정 관리와 생활 루틴에 관한 실용적인 가이드를 함께 제공합니다. 독자가 광고보다 먼저 콘텐츠 가치를 느끼는 사이트가 되는 것을 목표로 합니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white text-slate-900">
      <SiteHeader />
      <main>
        <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_42%),linear-gradient(180deg,#ffffff,#f8fafc)]">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 lg:px-8">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-sky-700">
              About Weekedule
            </p>
            <h1
              className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              일정 관리가 삶을 더 단순하게 만들어야 한다고 믿습니다.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Weekedule은 개인의 주간 계획부터 가족 일정 공유, 팀 회의 시간
              조율까지 더 가볍고 명확하게 만들기 위한 서비스입니다. 동시에 일정
              관리와 생활 루틴에 관한 고품질 가이드를 꾸준히 발행하는 정보형
              사이트를 지향합니다.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <h2
                  className="text-xl font-extrabold text-slate-950"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {principle.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {principle.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-10 px-5 pb-20 sm:px-6 lg:grid-cols-[1.1fr,0.9fr] lg:px-8">
          <article className="rounded-[2rem] border border-slate-200 p-8">
            <h2
              className="text-2xl font-extrabold text-slate-950"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              운영 방향
            </h2>
            <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
              <p>
                우리는 로그인하지 않아도 읽을 수 있는 공개 정보 페이지를
                충분히 제공하고, 검색엔진이 사이트 구조를 이해할 수 있도록
                메타데이터와 사이트맵을 관리합니다.
              </p>
              <p>
                또한 광고 수익보다 사용자 신뢰를 우선합니다. 사이트 승인 전
                광고 노출을 무리하게 늘리거나 클릭을 유도하는 방식은 사용하지
                않습니다.
              </p>
              <p>
                공개 가이드 콘텐츠는 실제 사용 장면에서 도움이 되는 주제를
                중심으로 작성하며, 운영 원칙과 정책 페이지도 별도로 공개합니다.
              </p>
            </div>
          </article>

          <aside className="rounded-[2rem] bg-slate-950 p-8 text-slate-200">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-sky-300">
              Next Step
            </p>
            <h2
              className="mt-4 text-2xl font-extrabold text-white"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Weekedule 가이드 읽기
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              일정 정리, 가족 캘린더, 회의 시간 조율 같은 주제를 먼저 살펴보면
              서비스가 어떤 사용자 문제를 해결하려는지 더 분명하게 이해할 수
              있습니다.
            </p>
            <Link
              href="/guides"
              className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950"
            >
              가이드 보러 가기
            </Link>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
