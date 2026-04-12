import Script from "next/script";
import { getLandingJsonLdString } from "@/src/shared/config/landing-json-ld";
import { Header } from "@/src/shared/ui/header";
import { MainBlock } from "@/src/shared/ui/main";

export const dynamic = "force-static";

export default function Home() {
  const jsonLd = getLandingJsonLdString();

  return (
    <>
      <Script
        id="movie-match-json-ld"
        type="application/ld+json"
        strategy="beforeInteractive"
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
