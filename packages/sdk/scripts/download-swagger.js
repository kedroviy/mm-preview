#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const OUTPUT_PATH = path.join(__dirname, "../swagger.json");

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/$/, "");
}

function normalizeSwaggerUrl(baseOrUrl) {
  const raw = String(baseOrUrl || "").trim();
  if (!raw) return "";

  // If user provided a full docs-json URL already, use it as-is.
  if (raw.endsWith("/api/docs-json") || raw.endsWith("/api/docs/api/docs-json")) {
    // also tolerate accidental double segment; we'll fix below
    return raw;
  }
  if (raw.endsWith("/api/docs-json/")) {
    return raw.replace(/\/$/, "");
  }

  // Some deployments expose Swagger UI at /api/docs.
  // If env points to that, treat it as base host and append /api/docs-json.
  const cleaned = stripTrailingSlash(raw).replace(/\/api\/docs\/?$/, "");
  return `${cleaned}/api/docs-json`;
}

// Prefer explicit override; otherwise reuse app backend env.
// This lets us switch between backends (movie-match vs admin) without code changes.
const SWAGGER_BASE =
  process.env.SWAGGER_URL ||
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api.moviematch.space"
    : "http://localhost:4000");

const SWAGGER_URL = normalizeSwaggerUrl(SWAGGER_BASE).replace(
  "/api/docs/api/docs-json",
  "/api/docs-json",
);

async function main() {
  console.log(`📡 Fetching swagger from: ${SWAGGER_URL}...`);

  try {
    const response = await fetch(SWAGGER_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Сохраняем полученный JSON в файл
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));

    console.log(`✓ Swagger downloaded and saved to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error(`✗ Failed to fetch swagger: ${error.message}`);
    console.error(`Make sure your backend is running at ${SWAGGER_URL}`);
    process.exit(1);
  }
}

main();
