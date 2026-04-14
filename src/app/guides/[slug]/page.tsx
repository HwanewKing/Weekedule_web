import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { absoluteUrl } from "@/lib/site";
import { getGuideBySlug, guideArticles } from "@/lib/siteContent";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return guideArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getGuideBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: absoluteUrl(`/guides/${article.slug}`),
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: absoluteUrl(`/guides/${article.slug}`),
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export default async function GuideArticlePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const article = getGuideBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="bg-white text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-8">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.06)] sm:p-12">
          <Link
            href="/guides"
            className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            가이드 목록으로
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
              {article.category}
            </span>
            <span>발행 {article.publishedAt}</span>
            <span>수정 {article.updatedAt}</span>
            <span>{article.readTime}</span>
          </div>

          <h1
            className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {article.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            {article.excerpt}
          </p>

          <div className="mt-12 space-y-10">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2
                  className="text-2xl font-extrabold text-slate-950"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-4 text-base leading-8 text-slate-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-sky-600" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <section className="mt-14 rounded-[1.75rem] bg-slate-950 p-7 text-slate-200">
            <h2
              className="text-2xl font-extrabold text-white"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              자주 묻는 질문
            </h2>
            <div className="mt-6 space-y-5">
              {article.faq.map((item) => (
                <div key={item.question} className="rounded-2xl bg-white/5 p-5">
                  <h3 className="text-base font-bold text-white">
                    {item.question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
