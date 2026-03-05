const fs = require("node:fs");
const path = require("node:path");

const SDK_ROOT = path.join(__dirname, "..");
const GENERATED_DIR = path.join(SDK_ROOT, "src", "generated");
const REQUESTS_DIR = path.join(GENERATED_DIR, "requests");
const HOOKS_DIR = path.join(GENERATED_DIR, "hooks");

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Create stub types.ts
function createTypesStub() {
  const typesPath = path.join(GENERATED_DIR, "types.ts");
  if (!fs.existsSync(typesPath)) {
    const stubContent = `// This file is a stub. Run "npm run generate:all" to generate actual types.
// This stub ensures TypeScript doesn't fail when generated files are missing.
export {};
`;
    ensureDir(GENERATED_DIR);
    fs.writeFileSync(typesPath, stubContent);
    console.log("✓ Created stub: types.ts");
  }
}

// Create stub requests
function createRequestsStub() {
  ensureDir(REQUESTS_DIR);

  const requestFiles = ["health", "auth", "users", "rooms"];
  const indexExports = [];

  requestFiles.forEach((fileName) => {
    const filePath = path.join(REQUESTS_DIR, `${fileName}.ts`);
    if (!fs.existsSync(filePath)) {
      const stubContent = `// This file is a stub. Run "npm run generate:all" to generate actual requests.
export {};
`;
      fs.writeFileSync(filePath, stubContent);
      console.log(`✓ Created stub: requests/${fileName}.ts`);
    }
    indexExports.push(`export * from './${fileName}';`);
  });

  // Create index.ts
  const indexPath = path.join(REQUESTS_DIR, "index.ts");
  if (!fs.existsSync(indexPath)) {
    const indexContent = `// This file is a stub. Run "npm run generate:all" to generate actual requests.
${indexExports.join("\n")}
`;
    fs.writeFileSync(indexPath, indexContent);
    console.log("✓ Created stub: requests/index.ts");
  }
}

// Create stub hooks
function createHooksStub() {
  ensureDir(HOOKS_DIR);

  const hookFiles = ["useHealth", "useAuth", "useUsers", "useRooms"];
  const indexExports = [];

  hookFiles.forEach((fileName) => {
    const filePath = path.join(HOOKS_DIR, `${fileName}.ts`);
    if (!fs.existsSync(filePath)) {
      let stubContent = `// This file is a stub. Run "npm run generate:all" to generate actual hooks.
export {};
`;

      // Special stub for useUsers to satisfy common imports
      if (fileName === "useUsers") {
        stubContent = `// This file is a stub. Run "npm run generate:all" to generate actual hooks.
import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

export function useUsersController_getProfile(
  options?: UseQueryOptions<unknown, Error, unknown, readonly unknown[]>
): UseQueryResult<unknown, Error> {
  return useQuery({
    queryKey: ['users', 'UsersController_getProfile', '__stub__'],
    queryFn: () => Promise.resolve(null),
    enabled: false,
    ...options,
  }) as UseQueryResult<unknown, Error>;
}

export const usersKeys = {
  UsersController_getProfile: () => ['users', 'UsersController_getProfile'] as const,
  UsersController_getUser: (_path: { userId: string }) => ['users', 'UsersController_getUser'] as const,
} as const;
`;
      }

      fs.writeFileSync(filePath, stubContent);
      console.log(`✓ Created stub: hooks/${fileName}.ts`);
    }
    indexExports.push(`export * from './${fileName}';`);
  });

  // Create index.ts
  const indexPath = path.join(HOOKS_DIR, "index.ts");
  if (!fs.existsSync(indexPath)) {
    const indexContent = `// This file is a stub. Run "npm run generate:all" to generate actual hooks.
${indexExports.join("\n")}
`;
    fs.writeFileSync(indexPath, indexContent);
    console.log("✓ Created stub: hooks/index.ts");
  }
}

// Main function
function main() {
  console.log("Creating stub files for generated SDK modules...");
  createTypesStub();
  createRequestsStub();
  createHooksStub();
  console.log("✓ All stub files created/verified");
}

main();
