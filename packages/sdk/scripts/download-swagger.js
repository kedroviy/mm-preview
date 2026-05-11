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

  let u = stripTrailingSlash(raw);

  // Full OpenAPI JSON URL (NestJS: /api/docs-json). Fix accidental /api/api/.
  if (u.endsWith("/docs-json")) {
    return u.replace(/\/api\/api\/docs-json$/, "/api/docs-json");
  }

  // Swagger UI base: strip and treat as API host.
  u = stripTrailingSlash(u).replace(/\/api\/docs\/?$/, "");

  // Env often sets NEXT_PUBLIC_API_URL to origin.../api — do not append /api again.
  if (u.endsWith("/api")) {
    return `${u}/docs-json`;
  }

  return `${u}/api/docs-json`;
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

const SWAGGER_URL = normalizeSwaggerUrl(SWAGGER_BASE);

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
