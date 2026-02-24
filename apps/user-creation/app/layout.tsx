import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "primeicons/primeicons.css";
import "./globals.css";
import { generateMetadataFromHeaders } from "@/src/shared/config/metadata";
import { Provider } from "@/src/shared/config/providers/Provider";

// Генерация метаданных на основе языка из заголовков
export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataFromHeaders();
}

const font = Montserrat({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={font.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
