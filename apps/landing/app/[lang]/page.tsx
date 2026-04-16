import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getLandingJsonLdString } from "@/src/shared/config/landing-json-ld";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  metadataByLang,
} from "@/src/shared/config/metadata";
import { getLandingDictionary } from "@/src/shared/i18n/landing-dictionary.server";
import { Header } from "@/src/shared/ui/header";

const MainBlock = nextDynamic(
  () =>
    import("@/src/shared/ui/main").then((mod) => ({ default: mod.MainBlock })),
  { ssr: true },
);

export const dynamic = "force-static";

/** Для Lighthouse: meta description ожидается на HTML страницы. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound();
  }
  const locale = lang as SupportedLocale;
  const meta = metadataByLang[locale] ?? metadataByLang.ru;
  return {
    description: meta.description,
    openGraph: {
      description: meta.openGraph.description,
      images: [
        {
          url: `/${locale}/opengraph-image`,
          alt: meta.openGraph.imageAlt,
        },
      ],
    },
    twitter: {
      images: [`/${locale}/opengraph-image`],
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound();
  }
  const locale = lang as SupportedLocale;
  const jsonLd = getLandingJsonLdString(locale);
  const dictionary = await getLandingDictionary(locale);

  return (
    <>
      <Script
        id="movie-match-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD без пользовательского ввода
        dangerouslySetInnerHTML={{
          // biome-ignore lint/style/useNamingConvention: имя поля задаёт React
          __html: jsonLd,
        }}
      />
      <div className="min-h-svh">
        <Header
          lang={locale}
          copy={dictionary.header}
          switcherLocales={dictionary.switcherLocales}
        />
        <MainBlock lang={locale} messages={dictionary.messages} />
      </div>
    </>
  );
}

