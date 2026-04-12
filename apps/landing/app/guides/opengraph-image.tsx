import { ImageResponse } from "next/og";

export const alt = "Movie Match — гайды: совместный и соло-подбор фильма";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function GuidesOpenGraphImage() {
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
        Movie Match
      </p>
      <p
        style={{
          marginTop: 28,
          fontSize: 56,
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: 1000,
        }}
      >
        Гайды: фильм вместе или в соло
      </p>
      <p style={{ marginTop: 20, fontSize: 28, opacity: 0.92, maxWidth: 900 }}>
        Лобби, Google Play, длинные запросы — одна витрина материалов
      </p>
    </div>,
    { ...size },
  );
}
