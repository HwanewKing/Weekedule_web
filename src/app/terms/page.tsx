import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "이용약관",
  description: "Weekedule 서비스 이용 조건과 책임 범위를 안내합니다.",
  alternates: {
    canonical: absoluteUrl("/terms"),
  },
};

const sections = [
  {
    title: "1. 목적",
    body: "이 약관은 Weekedule 서비스의 이용 조건과 절차, 이용자와 서비스 운영자의 권리와 책임을 규정합니다.",
  },
  {
    title: "2. 서비스 설명",
    body: "Weekedule은 개인 주간 일정 관리, 공유 일정 확인, 초대 링크 기반 협업 기능 등을 제공할 수 있으며, 운영 정책에 따라 기능은 변경될 수 있습니다.",
  },
  {
    title: "3. 이용자 의무",
    body: "이용자는 타인을 사칭하거나 허위 정보를 등록해서는 안 되며, 서비스 운영을 방해하거나 법령과 공공질서에 반하는 행위를 해서는 안 됩니다.",
  },
  {
    title: "4. 이용 제한",
    body: "약관 위반, 보안 위협, 서비스 안정성 훼손이 확인되는 경우 사전 통지 없이 일부 또는 전체 이용이 제한될 수 있습니다.",
  },
  {
    title: "5. 서비스 변경 및 중단",
    body: "운영상 또는 기술상 필요가 있는 경우 서비스의 전부 또는 일부가 변경되거나 중단될 수 있으며, 가능한 범위에서 사전에 안내합니다.",
  },
  {
    title: "6. 면책",
    body: "천재지변, 불가항력, 이용자 환경 문제로 발생한 손해에 대해 책임을 지지 않으며, 중요한 정보는 이용자가 별도로 백업하는 것을 권장합니다.",
  },
  {
    title: "7. 약관 변경",
    body: "약관이 변경되는 경우 사이트 또는 서비스 내 고지를 통해 안내하며, 공지된 시행일 이후에는 변경 약관이 적용됩니다.",
  },
  {
    title: "8. 준거법",
    body: "이 약관은 대한민국 법령을 준거법으로 하며, 서비스 이용과 관련한 분쟁은 관할 법원에서 해결할 수 있습니다.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
        <article className="rounded-[2rem] border border-slate-200 p-8 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-sky-700">
            Terms
          </p>
          <h1
            className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            이용약관
          </h1>
          <p className="mt-4 text-sm text-slate-500">최종 수정일: 2026-04-14</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2
                  className="text-2xl font-extrabold text-slate-950"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {section.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
