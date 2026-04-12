import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import Script from "next/script";
import { getLandingJsonLdString } from "@/src/shared/config/landing-json-ld";
import { metadataByLang } from "@/src/shared/config/metadata";
import { Header } from "@/src/shared/ui/header";

const MainBlock = nextDynamic(
  () =>
    import("@/src/shared/ui/main").then((mod) => ({ default: mod.MainBlock })),
  { ssr: true },
);

/** Явно на маршруте `/` — часть чекеров (в т.ч. моб. Lighthouse) ожидает meta description в HTML страницы. */
export const metadata: Metadata = {
  description: metadataByLang.ru.description,
  openGraph: {
    description: metadataByLang.ru.openGraph.description,
  },
};

export const dynamic = "force-static";

export default function Home() {
  const jsonLd = getLandingJsonLdString();

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
        <Header />
        <MainBlock />
      </div>
    </>
  );
}
