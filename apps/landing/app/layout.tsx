import type { Metadata, Viewport } from "next";
import { Outfit, Syne } from "next/font/google";
import "primeicons/primeicons.css";
import "./primeicons-font-display.css";
import "./globals.css";
import { rootLandingMetadata } from "@/src/shared/config/metadata";
import { Provider } from "@/src/shared/config/providers/Provider";

/** Статическая генерация: без headers/cookies/searchParams на layout. */
export const dynamic = "force-static";

export const metadata: Metadata = rootLandingMetadata;

/** Отдельный export — в Next 15 viewport/themeColor не задаются через Metadata. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf5ff" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b4b" },
  ],
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${fontDisplay.variable} ${fontSans.variable}`}>
      <body className="landing-body font-[family-name:var(--font-outfit)] antialiased">
        <a
          href="#top"
          className="fixed left-4 top-0 z-[9999] -translate-y-full rounded-b-lg bg-violet-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-900"
        >
          К основному содержимому
        </a>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
