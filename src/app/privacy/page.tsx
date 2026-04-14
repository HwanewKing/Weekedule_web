import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "Weekedule의 개인정보 수집, 이용, 보관, 문의 절차를 안내합니다.",
  alternates: {
    canonical: absoluteUrl("/privacy"),
  },
};

const sections = [
  {
    title: "1. 수집하는 정보",
    body: "Weekedule은 회원 가입과 서비스 제공 과정에서 이름, 이메일 주소, 암호화된 비밀번호, 사용자가 직접 입력한 일정 정보, 접속 로그와 같은 기본 운영 정보를 수집할 수 있습니다.",
  },
  {
    title: "2. 정보 이용 목적",
    body: "수집한 정보는 계정 인증, 일정 저장과 동기화, 공유 기능 제공, 오류 대응, 서비스 품질 개선을 위해 사용합니다.",
  },
  {
    title: "3. 보관 기간",
    body: "개인정보는 서비스 제공 목적이 달성되거나 사용자가 삭제를 요청할 때까지 보관하며, 관련 법령이 요구하는 경우 해당 기간 동안 별도로 보관할 수 있습니다.",
  },
  {
    title: "4. 제3자 제공",
    body: "Weekedule은 사용자의 동의 없이 개인정보를 제3자에게 판매하거나 임의 제공하지 않습니다. 다만 법령에 따른 요청이 있는 경우 예외가 있을 수 있습니다.",
  },
  {
    title: "5. 보호 조치",
    body: "비밀번호는 복호화가 불가능한 방식으로 저장하며, 서비스 운영 과정에서 합리적인 접근 통제와 전송 구간 보호 조치를 적용합니다.",
  },
  {
    title: "6. 쿠키와 세션",
    body: "로그인 상태 유지와 서비스 동작을 위해 세션 쿠키가 사용될 수 있습니다. 브라우저 설정에서 쿠키를 제한하면 일부 기능이 정상 동작하지 않을 수 있습니다.",
  },
  {
    title: "7. 이용자 권리",
    body: "이용자는 자신의 개인정보 조회, 수정, 삭제를 요청할 수 있으며, 계정 관련 문의는 서비스 내부 기능 또는 문의 페이지를 통해 접수할 수 있습니다.",
  },
  {
    title: "8. 문의",
    body: "개인정보 처리와 관련된 문의는 공개 문의 페이지 또는 서비스 내부 문의하기 채널을 통해 접수할 수 있습니다.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
        <article className="rounded-[2rem] border border-slate-200 p-8 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-sky-700">
            Privacy
          </p>
          <h1
            className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            개인정보처리방침
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
