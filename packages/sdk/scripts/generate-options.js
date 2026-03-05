// @ts-check
/**
 * Generates TanStack Query options factories from OpenAPI paths.
 * Each operation produces a function returning { queryKey, queryFn } (GET)
 * or { mutationKey, mutationFn } (POST/PUT/PATCH/DELETE).
 *
 * Output: src/generated/options/{tag}.ts + index.ts
 */
const fs = require("node:fs");
const path = require("node:path");

const SWAGGER_PATH = path.resolve(__dirname, "../swagger.json");
const OUTPUT_DIR = path.resolve(__dirname, "../src/generated/options");

function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function toPascalCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Strip the Controller prefix from operationId, e.g. "UsersController_getProfile" → "getProfile" */
function getCleanName(operationId) {
  const parts = operationId.split("_");
  return parts.length > 1 ? parts.slice(1).join("_") : operationId;
}

/**
 * Find the schema name for the success response (200/201).
 * Returns { ref: 'SchemaName' } | { inline: operationId + 'Response' } | { array: ref|inline } | null
 */
function getResponseSchemaInfo(op) {
  for (const code of ["200", "201"]) {
    const schema = op.responses?.[code]?.content?.["application/json"]?.schema;
    if (!schema) continue;

    if (schema.$ref) {
      return { type: "ref", name: schema.$ref.split("/").pop() };
    }
    if (schema.type === "array" && schema.items?.$ref) {
      return { type: "array", itemName: schema.items.$ref.split("/").pop() };
    }
    if (schema.type === "object" && schema.properties) {
      return { type: "inline", name: `${op.operationId}Response` };
    }
    if (schema.type === "array" && schema.items?.type === "object") {
      return { type: "inlineArray", name: `${op.operationId}Response` };
    }
  }
  return null;
}

/**
 * Find the schema name for the request body.
 * Returns { ref: 'SchemaName' } | { inline: operationId + 'Body' } | null
 */
function getBodySchemaInfo(op) {
  const schema = op.requestBody?.content?.["application/json"]?.schema;
  if (!schema) return null;
  if (schema.$ref) {
    return { type: "ref", name: schema.$ref.split("/").pop() };
  }
  if (schema.type === "object" && schema.properties) {
    return { type: "inline", name: `${op.operationId}Body` };
  }
  return null;
}

function getSchemaImport(info) {
  if (!info) return null;
  switch (info.type) {
    case "ref":
      return `${toCamelCase(info.name)}Schema`;
    case "inline":
      return `${toCamelCase(info.name)}Schema`;
    case "array":
      return `${toCamelCase(info.itemName)}Schema`;
    case "inlineArray":
      return `${toCamelCase(info.name)}Schema`;
    default:
      return null;
  }
}

function getValidationExpr(info) {
  if (!info) return null;
  const schemaVar = getSchemaImport(info);
  if (!schemaVar) return null;
  switch (info.type) {
    case "ref":
    case "inline":
      return `v.parse(${schemaVar}, response.data)`;
    case "array":
    case "inlineArray":
      return `v.parse(v.array(${schemaVar}), response.data)`;
    default:
      return null;
  }
}

function getResponseType(info) {
  if (!info) return "unknown";
  switch (info.type) {
    case "ref":
      return info.name;
    case "inline":
      return info.name;
    case "array":
      return `${info.itemName}[]`;
    case "inlineArray":
      return `${info.name}[]`;
    default:
      return "unknown";
  }
}

function getBodyType(info) {
  if (!info) return null;
  switch (info.type) {
    case "ref":
      return info.name;
    case "inline":
      return info.name;
    default:
      return "unknown";
  }
}

function generate() {
  if (!fs.existsSync(SWAGGER_PATH)) {
    console.warn("⚠ swagger.json not found. Creating option stubs.");
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUTPUT_DIR, "index.ts"), "export {};\n");
    return;
  }

  const swagger = JSON.parse(fs.readFileSync(SWAGGER_PATH, "utf-8"));
  const paths = swagger.paths || {};

  // Group operations by tag
  /** @type {Record<string, Array<{ method: string; urlPath: string; op: any }>>} */
  const tagOps = {};

  for (const [urlPath, methods] of Object.entries(paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (!op || typeof op !== "object" || !op.operationId) continue;
      const tag = (op.tags?.[0] || "default").toLowerCase();
      if (!tagOps[tag]) tagOps[tag] = [];
      tagOps[tag].push({ method: method.toUpperCase(), urlPath, op });
    }
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const tagFiles = [];

  for (const [tag, operations] of Object.entries(tagOps)) {
    const fileName = `${tag}.ts`;
    tagFiles.push(tag);

    const schemaImports = new Set();
    const typeImports = new Set();
    const functionBodies = [];

    for (const { method, urlPath, op } of operations) {
      const cleanName = getCleanName(op.operationId);
      const isQuery = method === "GET";
      const funcName = `${cleanName}Options`;

      // Collect params
      const pathParams = (op.parameters || []).filter((p) => p.in === "path");
      const queryParams = (op.parameters || []).filter((p) => p.in === "query");

      // Response
      const respInfo = getResponseSchemaInfo(op);
      const validationExpr = getValidationExpr(respInfo);
      const respSchemaImport = getSchemaImport(respInfo);
      if (respSchemaImport) schemaImports.add(respSchemaImport);
      if (respInfo) {
        const rt = getResponseType(respInfo);
        if (rt !== "unknown") typeImports.add(rt.replace("[]", ""));
      }

      // Body
      const bodyInfo = getBodySchemaInfo(op);
      const bodyType = getBodyType(bodyInfo);
      const bodySchemaImport = getSchemaImport(bodyInfo);
      if (bodySchemaImport) schemaImports.add(bodySchemaImport);
      if (bodyType && bodyType !== "unknown") typeImports.add(bodyType);

      // Build config type fields
      const configFields = ["  client: Client;"];
      if (pathParams.length > 0) {
        const pathFields = pathParams.map((p) => `${p.name}: string`).join("; ");
        configFields.push(`  path: { ${pathFields} };`);
      }
      if (queryParams.length > 0) {
        const queryFields = queryParams
          .map((p) => {
            const optional = !p.required ? "?" : "";
            return `${p.name}${optional}: string`;
          })
          .join("; ");
        configFields.push(`  query?: { ${queryFields} };`);
      }
      configFields.push("  credentials?: RequestCredentials;");
      configFields.push("  headers?: HeadersInit;");

      // Build URL expression
      let urlExpr;
      if (pathParams.length > 0) {
        let tpl = urlPath;
        for (const p of pathParams) {
          tpl = tpl.replace(`{${p.name}}`, `\${config.path.${p.name}}`);
        }
        urlExpr = `\`${tpl}\``;
      } else {
        urlExpr = `"${urlPath}"`;
      }

      // Build query key
      const keyParts = [`"${tag}"`, `"${cleanName}"`];
      if (pathParams.length > 0) keyParts.push("config.path");
      if (queryParams.length > 0) keyParts.push("config.query");

      const returnExpr = validationExpr || "response.data as any";

      if (isQuery) {
        // Query options
        const fnBody = `export function ${funcName}(config: {\n${configFields.join("\n")}\n}) {
  return {
    queryKey: [${keyParts.join(", ")}] as const,
    queryFn: async () => {
      const response = await config.client.get(${urlExpr}, {
        credentials: config.credentials ?? "include",
        headers: config.headers,${queryParams.length > 0 ? "\n        params: config.query as any," : ""}
      });
      return ${returnExpr};
    },
  };
}`;
        functionBodies.push(fnBody);
      } else {
        // Mutation options
        const httpMethod = method.toLowerCase();
        const isDeleteMethod = method === "DELETE";
        const mutationBodyParam = bodyType ? `body: ${bodyType}` : "";

        let mutationCall;
        if (isDeleteMethod) {
          mutationCall = `config.client.delete(${urlExpr}, {\n        credentials: config.credentials ?? "include",\n        headers: config.headers,\n      })`;
        } else if (bodyType) {
          mutationCall = `config.client.${httpMethod}(${urlExpr}, body, {\n        credentials: config.credentials ?? "include",\n        headers: config.headers,\n      })`;
        } else {
          mutationCall = `config.client.${httpMethod}(${urlExpr}, undefined, {\n        credentials: config.credentials ?? "include",\n        headers: config.headers,\n      })`;
        }

        const fnBody = `export function ${funcName}(config: {\n${configFields.join("\n")}\n}) {
  return {
    mutationKey: [${keyParts.join(", ")}] as const,
    mutationFn: async (${mutationBodyParam}) => {
      const response = await ${mutationCall};
      return ${returnExpr};
    },
  };
}`;
        functionBodies.push(fnBody);
      }
    }

    // Build file
    const lines = [
      "// Auto-generated by generate-options.js — DO NOT EDIT",
      'import * as v from "valibot";',
      'import type { Client } from "../../types";',
    ];

    // Schema + type imports
    if (schemaImports.size > 0 || typeImports.size > 0) {
      const importItems = [];
      for (const s of schemaImports) importItems.push(s);
      for (const t of typeImports) importItems.push(`type ${t}`);

      if (importItems.length > 0) {
        lines.push(`import { ${importItems.join(", ")} } from "../schemas";`);
      }
    }

    lines.push("");
    lines.push(functionBodies.join("\n\n"));
    lines.push("");

    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), lines.join("\n"));
    console.log(`  ✓ Generated ${operations.length} options in ${fileName}`);
  }

  // Index
  const indexLines = [
    "// Auto-generated by generate-options.js — DO NOT EDIT",
    ...tagFiles.map((tag) => `export * from "./${tag}";`),
    "",
  ];
  fs.writeFileSync(path.join(OUTPUT_DIR, "index.ts"), indexLines.join("\n"));
  console.log(`✓ Generated options index with ${tagFiles.length} tags`);
}

generate();
