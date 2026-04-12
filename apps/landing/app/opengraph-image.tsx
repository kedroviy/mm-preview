import { ImageResponse } from "next/og";

export const alt = "Movie Match — совместный выбор фильма с друзьями или парой";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #4c1d95 0%, #7c3aed 35%, #c026d3 70%, #5b21b6 100%)",
        color: "#fafafa",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: 48,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 28,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            opacity: 0.92,
            margin: 0,
          }}
        >
          Movie Match
        </p>
        <p
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.08,
            margin: 0,
            maxWidth: 980,
          }}
        >
          Фильм для вечера — без споров
        </p>
        <p
          style={{
            fontSize: 30,
            opacity: 0.9,
            margin: 0,
            maxWidth: 900,
          }}
        >
          Совместный выбор с друзьями или парой · Google Play
        </p>
      </div>
    </div>,
    { ...size },
  );
}
