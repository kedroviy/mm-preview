import type { Metadata, Viewport } from "next";
import "primeicons/primeicons.css";
import "./primeicons-font-display.css";
import "./globals.css";
import { rootLandingMetadata } from "@/src/shared/config/metadata";

export const metadata: Metadata = rootLandingMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf5ff" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b4b" },
  ],
};

/** Документ с `<html>` задаётся в `app/[lang]/layout.tsx` по `params.lang`. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
