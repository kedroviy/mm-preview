#!/usr/bin/env node

/**
 * Fetches the live swagger.json from the backend and saves it to
 * apps/dashboard/swagger.json (the committed source of truth).
 *
 * Usage: npm run sdk:update-swagger
 *
 * Run this whenever the backend API changes, then commit the updated file.
 */

const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const http = require("node:http");

const OUTPUT_PATH = path.join(__dirname, "../../../apps/dashboard/swagger.json");

const SWAGGER_URL =
  process.env.SWAGGER_URL ||
  "https://mm-admin-1.onrender.com/api/docs-json";

function fetchSwagger(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, { rejectUnauthorized: false }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} ${res.statusMessage}`));
        return;
      }
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Invalid JSON: ${e.message}`)); }
      });
    }).on("error", (e) => reject(e));
  });
}

async function main() {
  console.log(`Fetching swagger from ${SWAGGER_URL}...`);
  const swagger = await fetchSwagger(SWAGGER_URL);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(swagger, null, 2));
  console.log(`✓ Saved to ${OUTPUT_PATH}`);
  console.log("  Commit this file to keep the SDK in sync with the backend.");
}

main().catch((e) => {
  console.error(`✗ Failed: ${e.message}`);
  process.exit(1);
});
