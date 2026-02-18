#!/usr/bin/env node

const { execSync } = require("node:child_process");

const scripts = [
  "generate:swagger",
  "generate:types",
  "generate:requests",
  "generate:hooks",
];

console.log("Running all generation scripts...\n");

let hasErrors = false;

for (const script of scripts) {
  try {
    console.log(`Running: npm run ${script}`);
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: `${__dirname}/..` });
    console.log(`✓ ${script} completed\n`);
  } catch (error) {
    console.error(`✗ ${script} failed: ${error.message}\n`);
    hasErrors = true;
    // Continue with next script even if this one failed
  }
}

if (hasErrors) {
  console.log("⚠ Some generation scripts failed, but continuing...");
} else {
  console.log("✓ All generation scripts completed successfully");
}

process.exit(0); // Always exit with success to allow type-check to continue
