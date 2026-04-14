import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";

export default function NotFound() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-sky-700">
          404
        </p>
        <h1
          className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          찾으시는 페이지가 없습니다.
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          주소가 변경되었거나 존재하지 않는 페이지입니다. 공개 가이드나 메인
          페이지에서 다시 둘러보실 수 있습니다.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            홈으로
          </Link>
          <Link
            href="/guides"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-900"
          >
            가이드 보기
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
