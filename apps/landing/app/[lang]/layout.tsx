import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Outfit, Syne } from "next/font/google";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  createLandingMetadata,
} from "@/src/shared/config/metadata";
import { Provider } from "@/src/shared/config/providers/Provider";

export const dynamic = "force-static";
export const dynamicParams = false;

const fontDisplay = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["500", "600", "700", "800"],
  display: "swap",
  adjustFontFallback: true,
});

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  adjustFontFallback: true,
});

const skipLinkText: Record<SupportedLocale, string> = {
  ru: "К основному содержимому",
  en: "Skip to main content",
  es: "Saltar al contenido principal",
};

export function generateStaticParams(): { lang: SupportedLocale }[] {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound();
  }
  return createLandingMetadata(lang as SupportedLocale);
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    notFound();
  }
  const locale = lang as SupportedLocale;

  return (
    <html lang={locale} className={`${fontDisplay.variable} ${fontSans.variable}`}>
      <body className="landing-body font-[family-name:var(--font-outfit)] antialiased">
        <a
          href="#top"
          className="fixed left-4 top-0 z-[9999] -translate-y-full rounded-b-lg bg-violet-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-900"
        >
          {skipLinkText[locale]}
        </a>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
