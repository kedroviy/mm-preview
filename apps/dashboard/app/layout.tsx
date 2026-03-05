import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "primeicons/primeicons.css";
import "./globals.css";
import { ChunkErrorHandler } from "@/src/shared/components/ChunkErrorHandler";
import { ClientPageTransition } from "@/src/shared/components/ClientPageTransition";
import { generateMetadataFromHeaders } from "@/src/shared/config/metadata";
import { Provider } from "@/src/shared/config/providers/Provider";

// Генерация метаданных на основе языка из заголовков
export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataFromHeaders();
}

const font = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={font.className} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ChunkErrorHandler />
        <Provider>
          <ClientPageTransition>{children}</ClientPageTransition>
        </Provider>
      </body>
    </html>
  );
}
