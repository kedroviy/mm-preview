// @ts-check
/**
 * Generates React Query hooks that wrap options factories.
 * GET → useQuery, POST/PUT/PATCH/DELETE → useMutation.
 *
 * Output: src/generated/hooks/{useTag}.ts + index.ts
 */
const fs = require("node:fs");
const path = require("node:path");

const SWAGGER_PATH = path.resolve(__dirname, "../swagger.json");
const OUTPUT_DIR = path.resolve(__dirname, "../src/generated/hooks");

function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function toPascalCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCleanName(operationId) {
  const parts = operationId.split("_");
  return parts.length > 1 ? parts.slice(1).join("_") : operationId;
}

function createStubs() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const tags = ["health", "auth", "users", "rooms"];
  for (const tag of tags) {
    const fileName = `use${toPascalCase(tag)}.ts`;
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), "export {};\n");
  }

  // Special stub for useUsers with backward-compat exports
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "useUsers.ts"),
    [
      'import { useQuery, type UseQueryOptions } from "@tanstack/react-query";',
      "",
      "export const usersKeys = {",
      '  all: ["users"] as const,',
      '  UsersController_getProfile: () => [...usersKeys.all, "getProfile"] as const,',
      "};",
      "",
      "export function useUsersController_getProfile(options?: UseQueryOptions<any>) {",
      "  return useQuery({",
      "    queryKey: usersKeys.UsersController_getProfile(),",
      "    queryFn: async () => null,",
      "    ...options,",
      "  });",
      "}",
      "",
    ].join("\n"),
  );

  const indexLines = [
    ...tags.map((tag) => `export * from "./use${toPascalCase(tag)}";`),
    "",
  ];
  fs.writeFileSync(path.join(OUTPUT_DIR, "index.ts"), indexLines.join("\n"));
}

function generate() {
  if (!fs.existsSync(SWAGGER_PATH)) {
    console.warn("⚠ swagger.json not found. Creating hook stubs.");
    createStubs();
    return;
  }

  const swagger = JSON.parse(fs.readFileSync(SWAGGER_PATH, "utf-8"));
  const paths = swagger.paths || {};

  // Group by tag
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
    const fileName = `use${toPascalCase(tag)}.ts`;
    tagFiles.push(tag);

    const optionsImports = [];
    const hookBodies = [];

    // Generate query keys object (backward compat)
    const keyEntries = [];

    for (const { method, op } of operations) {
      const cleanName = getCleanName(op.operationId);
      const optionsFnName = `${cleanName}Options`;
      optionsImports.push(optionsFnName);

      const isQuery = method === "GET";
      const pathParams = (op.parameters || []).filter((p) => p.in === "path");
      const queryParams = (op.parameters || []).filter((p) => p.in === "query");

      // Key entry (backward compat)
      const legacyKeyName = `${op.operationId}`;
      keyEntries.push(
        `  ${legacyKeyName}: (${pathParams.map((p) => `${p.name}?: string`).join(", ")}) => [${[`"${tag}"`, `"${cleanName}"`].join(", ")}${pathParams.length > 0 ? ", " + pathParams.map((p) => `{ ${p.name} }`).join(", ") : ""}] as const,`,
      );

      // Hook name
      const hookName = `use${toPascalCase(op.operationId.replace(/_/g, "_"))}`;

      // Build config param type (everything except client)
      const configFields = [];
      if (pathParams.length > 0) {
        const pathFields = pathParams.map((p) => `${p.name}: string`).join("; ");
        configFields.push(`path: { ${pathFields} }`);
      }
      if (queryParams.length > 0) {
        const queryFields = queryParams
          .map((p) => `${p.name}${!p.required ? "?" : ""}: string`)
          .join("; ");
        configFields.push(`query?: { ${queryFields} }`);
      }

      const configType = configFields.length > 0
        ? `{ ${configFields.join("; ")} }`
        : undefined;

      if (isQuery) {
        const configParam = configType
          ? `config: ${configType}, options?: Partial<UseQueryOptions<any>>`
          : `options?: Partial<UseQueryOptions<any>>`;

        const spreadConfig = configFields.length > 0
          ? `...config, `
          : "";

        hookBodies.push(
          `export function ${hookName}(${configParam}) {
  return useQuery({
    ...${optionsFnName}({ ${spreadConfig}client: api, credentials: "include" }),
    ...${configType ? "options" : "options"},
  });
}`,
        );
      } else {
        // Mutation
        const configParam = configType
          ? `config: ${configType}, options?: Partial<UseMutationOptions<any, any, any>>`
          : `options?: Partial<UseMutationOptions<any, any, any>>`;

        const spreadConfig = configFields.length > 0
          ? `...config, `
          : "";

        hookBodies.push(
          `export function ${hookName}(${configParam}) {
  const queryClient = useQueryClient();
  return useMutation({
    ...${optionsFnName}({ ${spreadConfig}client: api, credentials: "include" }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["${tag}"] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}`,
        );
      }
    }

    // Build file
    const lines = [
      "// Auto-generated by generate-hooks.js — DO NOT EDIT",
      'import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";',
      'import { api } from "../../client";',
      `import { ${optionsImports.join(", ")} } from "../options/${tag}";`,
      "",
      `export const ${tag}Keys = {`,
      `  all: ["${tag}"] as const,`,
      ...keyEntries,
      "};",
      "",
      hookBodies.join("\n\n"),
      "",
    ];

    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), lines.join("\n"));
    console.log(`  ✓ Generated ${operations.length} hooks in ${fileName}`);
  }

  // Index
  const indexLines = [
    "// Auto-generated by generate-hooks.js — DO NOT EDIT",
    ...tagFiles.map((tag) => `export * from "./use${toPascalCase(tag)}";`),
    "",
  ];
  fs.writeFileSync(path.join(OUTPUT_DIR, "index.ts"), indexLines.join("\n"));
  console.log(`✓ Generated hooks index with ${tagFiles.length} tags`);
}

generate();
