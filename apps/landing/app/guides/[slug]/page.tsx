import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getGuideJsonLdString } from "@/src/shared/seo/guide-json-ld";
import {
  getAllGuideSlugs,
  getLongTailGuideBySlug,
} from "@/src/shared/seo/long-tail-guides";
import { Header } from "@/src/shared/ui/header";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllGuideSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getLongTailGuideBySlug(slug);
  if (!guide) {
    return {};
  }
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    keywords: guide.keywords,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `/guides/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: guide.metaTitle,
      description: guide.metaDescription,
    },
  };
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getLongTailGuideBySlug(slug);
  if (!guide) {
    notFound();
  }

  const jsonLd = getGuideJsonLdString(guide);

  return (
    <div className="min-h-svh">
      <Script
        id={`guide-json-ld-${slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD без пользовательского ввода
        dangerouslySetInnerHTML={{
          // biome-ignore lint/style/useNamingConvention: имя поля задаёт React
          __html: jsonLd,
        }}
      />
      <Header />
      <article className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <nav className="text-sm text-[var(--landing-muted)]">
          <Link href="/" className="text-violet-600 hover:underline">
            Главная
          </Link>
          <span className="mx-2">/</span>
          <Link href="/guides" className="text-violet-600 hover:underline">
            Гайды
          </Link>
          <span className="mx-2">/</span>
          <span className="line-clamp-1 text-[var(--landing-ink)]">
            {guide.h1}
          </span>
        </nav>
        <h1 className="mt-6 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl">
          {guide.h1}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--landing-muted)]">
          {guide.intro}
        </p>
        {guide.sections.map((section) => (
          <section key={section.title} className="mt-10">
            <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold text-[var(--landing-ink)] sm:text-2xl">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4 text-[var(--landing-muted)] leading-relaxed">
              {section.paragraphs.map((p, i) => (
                <p key={`${section.title}-${i}`}>{p}</p>
              ))}
            </div>
          </section>
        ))}
        <div className="mt-12 flex flex-wrap gap-4 border-t border-violet-100 pt-10">
          <Link
            href="/guides"
            className="text-sm font-semibold text-violet-600 hover:underline"
          >
            ← Все гайды
          </Link>
          <Link
            href="/#download"
            className="text-sm font-semibold text-violet-600 hover:underline"
          >
            Google Play и веб-старт
          </Link>
        </div>
      </article>
    </div>
  );
}
