import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  createLandingMetadata,
} from "@/src/shared/config/metadata";

export const dynamic = "force-static";
export const dynamicParams = false;

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
  return children;
}

