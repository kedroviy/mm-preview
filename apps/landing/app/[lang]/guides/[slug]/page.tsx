import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/src/shared/config/metadata";
import { getGuidesPagesCopy } from "@/src/shared/i18n/guides-pages";
import { getGuideJsonLdString } from "@/src/shared/seo/guide-json-ld";
import {
  getAllGuideSlugs,
  getLongTailGuideBySlug,
} from "@/src/shared/seo/long-tail-guides";
import { Header } from "@/src/shared/ui/header";

export const dynamic = "force-static";

export function generateStaticParams(): { lang: SupportedLocale; slug: string }[] {
  const slugs = getAllGuideSlugs();
  const out: { lang: SupportedLocale; slug: string }[] = [];
  for (const lang of SUPPORTED_LOCALES) {
    for (const s of slugs) {
      out.push({ lang, slug: s.slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound();
  }
  const locale = lang as SupportedLocale;
  const guide = getLongTailGuideBySlug(slug, locale);
  if (!guide) {
    return {};
  }
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    keywords: guide.keywords,
    alternates: {
      canonical: `/${locale}/guides/${slug}`,
      languages: {
        "ru-RU": `/ru/guides/${slug}`,
        "en-US": `/en/guides/${slug}`,
        "es-ES": `/es/guides/${slug}`,
        "x-default": `/ru/guides/${slug}`,
      },
    },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: `/${locale}/guides/${slug}`,
      type: "article",
      images: [
        {
          url: `/${locale}/guides/${slug}/opengraph-image`,
          alt: guide.h1,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: [`/${locale}/guides/${slug}/opengraph-image`],
    },
  };
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound();
  }
  const locale = lang as SupportedLocale;
  const guide = getLongTailGuideBySlug(slug, locale);
  if (!guide) {
    notFound();
  }

  const g = getGuidesPagesCopy(locale);
  const jsonLd = getGuideJsonLdString(guide, locale);

  return (
    <div className="min-h-svh">
      <Script
        id={`guide-json-ld-${lang}-${slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD без пользовательского ввода
        dangerouslySetInnerHTML={{
          // biome-ignore lint/style/useNamingConvention: имя поля задаёт React
          __html: jsonLd,
        }}
      />
      <Header lang={locale} />
      <main id="top" tabIndex={-1}>
        <article className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8">
          <nav
            className="text-sm text-[var(--landing-muted)]"
            aria-label="Breadcrumbs"
          >
            <Link
              href={`/${locale}`}
              className="text-violet-600 hover:underline"
            >
              {g.home}
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <Link
              href={`/${locale}/guides`}
              className="text-violet-600 hover:underline"
            >
              {g.guides}
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
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
              href={`/${locale}/guides`}
              className="text-sm font-semibold text-violet-600 hover:underline"
            >
              {g.articleAllGuides}
            </Link>
            <Link
              href={`/${locale}#download`}
              className="text-sm font-semibold text-violet-600 hover:underline"
            >
              {g.articlePlayWeb}
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
