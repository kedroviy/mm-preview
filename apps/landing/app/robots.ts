import type { MetadataRoute } from "next";
import { getLandingSiteUrl } from "@/src/shared/config/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getLandingSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ""),
  };
}
