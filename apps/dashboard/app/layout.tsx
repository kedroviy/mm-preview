import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "primeicons/primeicons.css";
import "./globals.css";
import { ClientPageTransition } from "@/src/shared/components/ClientPageTransition";
import { Provider } from "@/src/shared/config/providers/Provider";

export const metadata: Metadata = {
  title: "Dashboard - Movie match",
  description: "Your dashboard",
  icons: {
    icon: "./favicon.ico",
  },
};

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
        <Provider>
          <ClientPageTransition>{children}</ClientPageTransition>
        </Provider>
      </body>
    </html>
  );
}
