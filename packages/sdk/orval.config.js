const path = require("node:path");

// Inline spec avoids Windows path/key mismatches in Orval's resolver (`specs[target]`).
const openApiSpec = require("./openapi.json");

/** @type {import('orval').OrvalConfig} */
module.exports = {
  movieApi: {
    input: {
      target: openApiSpec,
    },
    output: {
      mode: "single",
      target: path.join(__dirname, "src", "generated", "orval", "api.ts"),
      schemas: path.join(__dirname, "src", "generated", "orval", "models"),
      client: "react-query",
      httpClient: "axios",
      baseUrl: "",
      clean: true,
      formatter: "biome",
      override: {
        mutator: {
          path: "./src/orval-mutator.ts",
          name: "customInstance",
        },
        query: {
          signal: true,
        },
      },
    },
  },
};
