/**
 * Downloads OpenAPI JSON from the configured URL and writes packages/sdk/openapi.json
 * Usage: node scripts/fetch-openapi.js
 *
 * Env:
 * - OPENAPI_SPEC_URL — override URL (default: movie-api production).
 * - OPENAPI_ALLOW_INSECURE_TLS=1 — use HTTPS without cert verification (corporate proxies only).
 */
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const http = require("node:http");

const DEFAULT_URL =
  process.env.OPENAPI_SPEC_URL ?? "https://movie-api.moviematch.space/api-json";

const outPath = path.join(__dirname, "..", "openapi.json");

function fetchWithNodeHttps(url, { insecure } = { insecure: false }) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        rejectUnauthorized: insecure ? false : undefined,
      },
      (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          res.resume();
          fetchWithNodeHttps(new URL(res.headers.location, url).href, {
            insecure,
          }).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} from ${url}`));
          res.resume();
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      },
    );
    req.on("error", reject);
  });
}

async function main() {
  const insecure = process.env.OPENAPI_ALLOW_INSECURE_TLS === "1";
  console.log(
    `Fetching OpenAPI from ${DEFAULT_URL}${insecure ? " (insecure TLS)" : ""}`,
  );

  const raw = insecure
    ? await fetchWithNodeHttps(DEFAULT_URL, { insecure: true })
    : await (async () => {
        try {
          const response = await fetch(DEFAULT_URL, { redirect: "follow" });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} from ${DEFAULT_URL}`);
          }
          return response.text();
        } catch (err) {
          if (err?.cause?.code === "SELF_SIGNED_CERT_IN_CHAIN") {
            throw new Error(
              "TLS verification failed. Use OPENAPI_ALLOW_INSECURE_TLS=1 only on trusted dev machines, or fix the system CA store.",
            );
          }
          throw err;
        }
      })();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Response is not valid JSON — check OPENAPI_SPEC_URL");
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
