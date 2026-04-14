import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "운영 원칙",
  description:
    "Weekedule 공개 콘텐츠의 작성 기준, 업데이트 원칙, 광고 운영 원칙을 안내합니다.",
  alternates: {
    canonical: absoluteUrl("/editorial-policy"),
  },
};

const policies = [
  {
    title: "독자 우선",
    body: "공개 페이지와 가이드는 검색 유입을 위한 얇은 페이지보다 실제로 읽을 가치가 있는 내용을 우선합니다. 광고 배치보다 콘텐츠 완성도를 먼저 고려합니다.",
  },
  {
    title: "명확한 업데이트",
    body: "가이드 문서에는 발행일과 수정일을 함께 표시합니다. 정보가 바뀌었거나 설명이 부족하다고 판단되면 문서를 갱신합니다.",
  },
  {
    title: "과장 금지",
    body: "서비스 기능, 생산성 효과, 광고 정책 대응 가능성에 대해 과장된 표현을 사용하지 않습니다. 특히 외부 심사 결과를 보장하는 식의 문구는 사용하지 않습니다.",
  },
  {
    title: "정책 준수",
    body: "Google Publisher Policies와 AdSense 정책을 위반할 수 있는 클릭 유도, 광고 오인 배치, 얇은 페이지 생성, 자동 트래픽 유입 방식은 사용하지 않습니다.",
  },
];

export default function EditorialPolicyPage() {
  return (
    <div className="bg-white text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-sky-700">
            Editorial Policy
          </p>
          <h1
            className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Weekedule 공개 콘텐츠 운영 원칙
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            이 페이지는 Weekedule 사이트가 어떤 기준으로 공개 콘텐츠를 만들고,
            어떤 방식으로 광고와 정책을 다루는지 설명합니다.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          {policies.map((policy) => (
            <article
              key={policy.title}
              className="rounded-[1.75rem] border border-slate-200 p-7"
            >
              <h2
                className="text-2xl font-extrabold text-slate-950"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                {policy.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {policy.body}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[2rem] bg-slate-950 p-8 text-slate-200 sm:p-10">
          <h2
            className="text-2xl font-extrabold text-white"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            광고 운영 원칙
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-400">
            <p>
              광고는 콘텐츠를 가리지 않는 위치에만 배치하며, 탐색 메뉴나
              다운로드 버튼처럼 오인될 수 있는 방식으로 꾸미지 않습니다.
            </p>
            <p>
              승인 전에는 불필요한 광고 스크립트를 기본 활성화하지 않고, 승인 후
              환경 설정을 통해 명시적으로 적용하는 방식을 사용합니다.
            </p>
            <p>
              사이트는 광고 노출 자체를 목적으로 만든 비콘텐츠 페이지를
              생성하지 않으며, 공개 콘텐츠와 정책 페이지를 함께 유지합니다.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
