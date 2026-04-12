import { ImageResponse } from "next/og";
import { getLongTailGuideBySlug } from "@/src/shared/seo/long-tail-guides";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function GuideOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getLongTailGuideBySlug(slug);
  const title = guide?.h1 ?? "Movie Match";
  const line = title.length > 72 ? `${title.slice(0, 69).trim()}…` : title;

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 56,
        background:
          "linear-gradient(135deg, #4c1d95 0%, #7c3aed 40%, #c026d3 75%, #5b21b6 100%)",
        color: "#fafafa",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <p
        style={{
          fontSize: 26,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          opacity: 0.9,
          margin: 0,
        }}
      >
        Movie Match · гайд
      </p>
      <p
        style={{
          marginTop: 28,
          fontSize: 52,
          fontWeight: 800,
          lineHeight: 1.12,
          maxWidth: 1040,
        }}
      >
        {line}
      </p>
    </div>,
    { ...size },
  );
}
