import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "primereact/resources/themes/lara-light-indigo/theme.css"; 
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./globals.css";
import { Provider } from "@/src/shared/config/providers/Provider";
import { generateMetadataFromHeaders } from "@/src/shared/config/metadata";

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
    <html lang="ru" className={font.className}>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
