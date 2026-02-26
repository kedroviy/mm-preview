#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const http = require("node:http");

// Swagger JSON endpoint
// Если ваш бэкенд использует другой путь, установите переменную окружения SWAGGER_URL
const _SWAGGER_URL =
  process.env.SWAGGER_URL || "http://localhost:4000/api/docs-json";
const OUTPUT_PATH = path.join(__dirname, "../swagger.json");

function downloadSwagger(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download Swagger: ${res.statusCode} ${res.statusMessage}`,
            ),
          );
          return;
        }

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (error) {
            reject(new Error(`Failed to parse Swagger JSON: ${error.message}`));
          }
        });
      })
      .on("error", (error) => {
        reject(new Error(`Failed to download Swagger: ${error.message}`));
      });
  });
}

async function main() {
  // Build the list of URLs to try
  const urlsToTry = [];

  if (process.env.SWAGGER_URL) {
    const base = process.env.SWAGGER_URL.replace(/\/$/, "");
    // If the env var already looks like a full docs-json URL, use it directly.
    // Otherwise expand it with common swagger path suffixes.
    if (base.includes("docs-json") || base.includes("swagger.json") || base.includes("api-json")) {
      urlsToTry.push(base);
    } else {
      urlsToTry.push(
        `${base}/api/docs-json`,
        `${base}/api/docs/api-json`,
        `${base}/api/docs/swagger.json`,
        base,
      );
    }
  }

  // Always include localhost fallbacks for local development
  urlsToTry.push(
    "http://localhost:4000/api/docs-json",
    "http://localhost:4000/api/docs/api-json",
    "http://localhost:4000/api/docs/swagger.json",
  );

  for (const url of urlsToTry) {
    try {
      console.log(`Trying to download Swagger from ${url}...`);
      const swagger = await downloadSwagger(url);
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(swagger, null, 2));
      console.log(`✓ Swagger saved to ${OUTPUT_PATH}`);
      return;
    } catch (error) {
      console.log(`✗ Failed: ${error.message}`);
    }
  }

  // Fallback: use committed swagger.json from apps/dashboard if it exists
  const committedSwaggerPath = path.join(__dirname, "../../../apps/dashboard/swagger.json");
  if (fs.existsSync(committedSwaggerPath)) {
    console.log("⚠ Using committed apps/dashboard/swagger.json as fallback...");
    fs.copyFileSync(committedSwaggerPath, OUTPUT_PATH);
    console.log(`✓ Swagger copied from committed file to ${OUTPUT_PATH}`);
    return;
  }

  // Last resort: create a minimal stub
  console.warn("⚠ Failed to download Swagger from all tried URLs");
  console.log("Creating minimal stub swagger.json...");

  const stubSwagger = {
    openapi: "3.0.0",
    info: {
      title: "API Stub",
      version: "1.0.0",
      description:
        "This is a stub file. API was not available during generation.",
    },
    paths: {},
    components: {
      schemas: {},
    },
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(stubSwagger, null, 2));
  console.log(`✓ Stub swagger.json created at ${OUTPUT_PATH}`);
}

main();
