import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/src/shared/config/metadata";
import { getAllGuideSlugs } from "@/src/shared/seo/long-tail-guides";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllGuideSlugs();
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${DEFAULT_LOCALE}/guides/${slug}`);
}
