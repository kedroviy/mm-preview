import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Provider } from "@/src/shared/config/providers/Provider";

export const metadata: Metadata = {
  title: "Create Account - Movie match",
  description: "Create your account",
  icons: {
    icon: "./favicon.ico",
  },
};

const font = Montserrat({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={font.className}>
      <body suppressHydrationWarning>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
