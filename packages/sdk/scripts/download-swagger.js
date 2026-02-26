#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const OUTPUT_PATH = path.join(__dirname, "../swagger.json");
const SOURCE_PATH = path.join(__dirname, "../../../apps/dashboard/swagger.json");

/**
 * Copies apps/dashboard/swagger.json → packages/sdk/swagger.json.
 *
 * apps/dashboard/swagger.json is the committed source of truth.
 * Run "npm run sdk:generate:swagger" manually when the backend API changes,
 * commit the updated file, and re-deploy.
 */
function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`✗ Source swagger not found: ${SOURCE_PATH}`);
    process.exit(1);
  }

  fs.copyFileSync(SOURCE_PATH, OUTPUT_PATH);
  console.log(`✓ Swagger copied from apps/dashboard/swagger.json to packages/sdk/swagger.json`);
}

main();
