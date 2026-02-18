import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "primeicons/primeicons.css";
import "./globals.css";
import { Provider } from "@/src/shared/config/providers/Provider";
import { ClientPageTransition } from "@/src/shared/components/ClientPageTransition";

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
    <html lang="en" className={font.className}>
      <body className="font-sans antialiased">
        <Provider>
          <ClientPageTransition>{children}</ClientPageTransition>
        </Provider>
      </body>
    </html>
  );
}
