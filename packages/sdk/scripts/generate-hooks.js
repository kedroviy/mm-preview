#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const SWAGGER_PATH = path.join(__dirname, "../swagger.json");
const OUTPUT_DIR = path.join(__dirname, "../src/generated/hooks");

function toPascalCase(str) {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/\s+/g, "");
}

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function generateHook(operation, path, method, tag) {
  const operationId = operation.operationId || `${method}${toPascalCase(path)}`;
  const functionName = toCamelCase(operationId);
  const hookName = `use${toPascalCase(functionName)}`;

  const params = operation.parameters || [];
  const pathParams = params.filter((p) => p.in === "path").map((p) => p.name);
  const queryParams = params.filter((p) => p.in === "query");
  const hasBody =
    ["post", "put", "patch"].includes(method.toLowerCase()) &&
    operation.requestBody;
  const isMutation = ["post", "put", "patch", "delete"].includes(
    method.toLowerCase(),
  );

  const returnType = getReturnType(operation.responses);

  if (isMutation) {
    // Generate mutation hook
    const bodyType = hasBody ? getBodyType(operation.requestBody) : "void";

    return `
/**
 * ${operation.summary || operation.description || `${method.toUpperCase()} ${path}`}
 */
export function ${hookName}() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (${hasBody ? `data: ${bodyType}` : ""}) => {
      ${pathParams.length > 0 ? `const { ${pathParams.join(", ")}, ...rest } = data as any;` : ""}
      const response: ApiResponse<${returnType}> = await ${functionName}(${[
        pathParams.length > 0 ? `{ ${pathParams.join(", ")} }` : "",
        queryParams.length > 0 ? "rest" : "",
        hasBody && pathParams.length === 0 ? "data" : hasBody ? "rest" : "",
      ]
        .filter(Boolean)
        .join(", ")});
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['${tag}'] });
    },
  });
}
`;
  } else {
    // Generate query hook
    const queryKeyName = `${tag}Keys`;

    return `
/**
 * ${operation.summary || operation.description || `${method.toUpperCase()} ${path}`}
 */
export function ${hookName}(${pathParams.length > 0 ? `path: { ${pathParams.map((p) => `${p}: string`).join(", ")} }, ` : ""}${queryParams.length > 0 ? `params?: { ${queryParams.map((p) => `${p.name}?: ${getTypeFromSchema(p.schema)}`).join(", ")} }, ` : ""}options?: UseQueryOptions<${returnType}>) {
  return useQuery({
    queryKey: ${queryKeyName}.${functionName}(${pathParams.length > 0 ? "path" : ""}${queryParams.length > 0 ? ", params" : ""}),
    queryFn: async () => {
      const response: ApiResponse<${returnType}> = await ${functionName}(${[
        pathParams.length > 0 ? "path" : "",
        queryParams.length > 0 ? "params" : "",
      ]
        .filter(Boolean)
        .join(", ")});
      return response.data;
    },
    ...options,
  });
}
`;
  }
}

function getTypeFromSchema(schema) {
  if (!schema) {
    return "any";
  }
  if (schema.type === "string") {
    return "string";
  }
  if (schema.type === "number" || schema.type === "integer") {
    return "number";
  }
  if (schema.type === "boolean") {
    return "boolean";
  }
  if (schema.type === "array") {
    const itemsType = getTypeFromSchema(schema.items);
    return `${itemsType}[]`;
  }
  if (schema.$ref) {
    const refName = schema.$ref.split("/").pop();
    return refName;
  }
  return "any";
}

function getBodyType(requestBody) {
  if (!requestBody || !requestBody.content) {
    return "any";
  }
  const jsonContent = requestBody.content["application/json"];
  if (!jsonContent || !jsonContent.schema) {
    return "any";
  }
  return getTypeFromSchema(jsonContent.schema);
}

function getReturnType(responses) {
  const successResponse =
    responses["200"] || responses["201"] || responses["204"];
  if (!successResponse || !successResponse.content) {
    return "any";
  }
  const jsonContent = successResponse.content["application/json"];
  if (!jsonContent || !jsonContent.schema) {
    return "any";
  }
  return getTypeFromSchema(jsonContent.schema);
}

function generateHooks() {
  try {
    if (!fs.existsSync(SWAGGER_PATH)) {
      console.warn("⚠ Swagger file not found. Creating empty stub files.");
      // Create empty stub files
      if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      }
      // Create stub files for each expected hook file
      const stubFiles = ["useHealth", "useAuth", "useUsers", "useRooms"];
      stubFiles.forEach((fileName) => {
        let stubContent = `// This file is a stub. Run "npm run generate:swagger" and "npm run generate:hooks" to generate actual hooks.
export {};
`;
        // Add specific stub exports for useUsers
        if (fileName === "useUsers") {
          stubContent = `// This file is a stub. Run "npm run generate:swagger" and "npm run generate:hooks" to generate actual hooks.
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

export function useUsersController_getProfile(
  _options?: UseQueryOptions<unknown, Error, unknown, readonly unknown[]>
): UseQueryResult<unknown, Error> {
  throw new Error('This is a stub. Run "npm run generate:all" to generate actual hooks.');
}

export const usersKeys = {
  UsersController_getProfile: () => ['users', 'UsersController_getProfile'] as const,
  UsersController_getUser: (_path: { userId: string }) => ['users', 'UsersController_getUser'] as const,
} as const;
`;
        }
        fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.ts`), stubContent);
      });
      // Create index file that exports from all stub files
      const indexContent = stubFiles
        .map((fileName) => `export * from './${fileName}';`)
        .join("\n");
      fs.writeFileSync(path.join(OUTPUT_DIR, "index.ts"), indexContent);
      console.log(`✓ Stub files created in ${OUTPUT_DIR}`);
      return;
    }

    const swagger = JSON.parse(fs.readFileSync(SWAGGER_PATH, "utf-8"));

    // Check if swagger is a stub (empty paths)
    if (!swagger.paths || Object.keys(swagger.paths).length === 0) {
      console.warn(
        "⚠ Swagger file appears to be a stub. Creating empty stub files.",
      );
      if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      }
      // Create stub files for each expected hook file
      const stubFiles = ["useHealth", "useAuth", "useUsers", "useRooms"];
      stubFiles.forEach((fileName) => {
        let stubContent = `// This file is a stub. Run "npm run generate:swagger" and "npm run generate:hooks" to generate actual hooks.
export {};
`;
        // Add specific stub exports for useUsers
        if (fileName === "useUsers") {
          stubContent = `// This file is a stub. Run "npm run generate:swagger" and "npm run generate:hooks" to generate actual hooks.
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

export function useUsersController_getProfile(
  _options?: UseQueryOptions<unknown, Error, unknown, readonly unknown[]>
): UseQueryResult<unknown, Error> {
  throw new Error('This is a stub. Run "npm run generate:all" to generate actual hooks.');
}

export const usersKeys = {
  UsersController_getProfile: () => ['users', 'UsersController_getProfile'] as const,
  UsersController_getUser: (_path: { userId: string }) => ['users', 'UsersController_getUser'] as const,
} as const;
`;
        }
        fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.ts`), stubContent);
      });
      // Create index file that exports from all stub files
      const indexContent = stubFiles
        .map((fileName) => `export * from './${fileName}';`)
        .join("\n");
      fs.writeFileSync(path.join(OUTPUT_DIR, "index.ts"), indexContent);
      console.log(`✓ Stub files created in ${OUTPUT_DIR}`);
      return;
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const hooksByTag = {};
    const queryKeysByTag = {};

    // Group hooks by tag
    Object.entries(swagger.paths || {}).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (!operation.operationId) {
          return;
        }

        const tag = operation.tags?.[0] || "default";
        if (!hooksByTag[tag]) {
          hooksByTag[tag] = [];
          queryKeysByTag[tag] = [];
        }

        const operationId =
          operation.operationId || `${method}${toPascalCase(path)}`;
        const functionName = toCamelCase(operationId);
        const hook = generateHook(operation, path, method, tag);

        hooksByTag[tag].push({ functionName, hook });

        const params = operation.parameters || [];
        const pathParams = params
          .filter((p) => p.in === "path")
          .map((p) => p.name);
        const queryParams = params.filter((p) => p.in === "query");
        const isQuery = !["post", "put", "patch", "delete"].includes(
          method.toLowerCase(),
        );

        if (isQuery) {
          queryKeysByTag[tag].push({
            functionName,
            pathParams,
            queryParams,
          });
        }
      });
    });

    // Generate files by tag
    Object.entries(hooksByTag).forEach(([tag, hooks]) => {
      const fileName = `use${toPascalCase(tag)}.ts`;
      const filePath = path.join(OUTPUT_DIR, fileName);

      const imports = `import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';\nimport { ${hooks.map((h) => h.functionName).join(", ")} } from '../requests/${toCamelCase(tag)}';\nimport type { ApiResponse } from '../types';\n`;

      // Generate query keys
      const queryKeys = queryKeysByTag[tag] || [];
      let queryKeysCode = "";
      if (queryKeys.length > 0) {
        queryKeysCode = `\nexport const ${toCamelCase(tag)}Keys = {\n`;
        queryKeys.forEach(({ functionName, pathParams, queryParams }) => {
          const keyParams = [
            ...pathParams.map((p) => `${p}: string`),
            ...queryParams.map(
              (p) => `${p.name}?: ${getTypeFromSchema(p.schema)}`,
            ),
          ];
          queryKeysCode += `  ${functionName}: (${keyParams.length > 0 ? keyParams.join(", ") : ""}) => ['${tag}', '${functionName}'${pathParams.length > 0 ? `, ...Object.values({ ${pathParams.join(", ")} })` : ""}${queryParams.length > 0 ? ", params" : ""}],\n`;
        });
        queryKeysCode += "} as const;\n";
      }

      const hooksCode = hooks.map((h) => h.hook).join("\n");

      const content = `${imports}${queryKeysCode}${hooksCode}`;

      fs.writeFileSync(filePath, content);
      console.log(`✓ Generated ${fileName} with ${hooks.length} hooks`);
    });

    // Generate index file
    const indexContent = Object.keys(hooksByTag)
      .map((tag) => `export * from './use${toPascalCase(tag)}';`)
      .join("\n");

    fs.writeFileSync(path.join(OUTPUT_DIR, "index.ts"), indexContent);
    console.log("✓ Generated index.ts");
    console.log(
      `✓ Total: ${Object.values(hooksByTag).flat().length} hooks generated`,
    );
  } catch (error) {
    console.error("✗ Error:", error.message);
    // Create stub files on error
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    // Create stub files for each expected hook file
    const stubFiles = ["useHealth", "useAuth", "useUsers", "useRooms"];
    stubFiles.forEach((fileName) => {
      let stubContent = `// This file is a stub. Generation failed: ${error.message}
export {};
`;
      // Add specific stub exports for useUsers
      if (fileName === "useUsers") {
        stubContent = `// This file is a stub. Generation failed: ${error.message}
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

export function useUsersController_getProfile(
  _options?: UseQueryOptions<unknown, Error, unknown, readonly unknown[]>
): UseQueryResult<unknown, Error> {
  throw new Error('This is a stub. Run "npm run generate:all" to generate actual hooks.');
}

export const usersKeys = {
  UsersController_getProfile: () => ['users', 'UsersController_getProfile'] as const,
  UsersController_getUser: (_path: { userId: string }) => ['users', 'UsersController_getUser'] as const,
} as const;
`;
      }
      fs.writeFileSync(path.join(OUTPUT_DIR, `${fileName}.ts`), stubContent);
    });
    // Create index file that exports from all stub files
    const indexContent = stubFiles
      .map((fileName) => `export * from './${fileName}';`)
      .join("\n");
    fs.writeFileSync(path.join(OUTPUT_DIR, "index.ts"), indexContent);
    console.log(`✓ Stub files created in ${OUTPUT_DIR}`);
  }
}

generateHooks();
