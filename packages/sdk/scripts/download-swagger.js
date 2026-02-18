#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const http = require("node:http");

const SWAGGER_URL = process.env.SWAGGER_URL || "http://localhost:4000/api-json";
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
  try {
    console.log(`Downloading Swagger from ${SWAGGER_URL}...`);
    const swagger = await downloadSwagger(SWAGGER_URL);

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(swagger, null, 2));
    console.log(`✓ Swagger saved to ${OUTPUT_PATH}`);
  } catch (error) {
    console.warn("⚠ Failed to download Swagger:", error.message);
    console.log("Creating minimal stub swagger.json...");

    // Create minimal stub swagger.json to allow generation to continue
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
}

main();
