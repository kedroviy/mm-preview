import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mm-preview/ui", "@mm-preview/sdk"],
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL || "https://mm-admin.onrender.com";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      // WebSocket rewrites (для локальной разработки)
      // Внимание: Vercel не поддерживает WebSocket через rewrites
      // В продакшене WebSocket должен использовать прямой URL к бэкенду
      {
        source: "/socket.io/:path*",
        destination: `${backendUrl}/socket.io/:path*`,
      },
      {
        source: "/rooms/:path*",
        destination: `${backendUrl}/rooms/:path*`,
      },
    ];
  },
  webpack: (config, { isServer: _isServer }) => {
    // For pnpm, we need to ensure modules are resolved correctly
    // pnpm uses symlinks and a different node_modules structure
    const appNodeModules = path.resolve(__dirname, "node_modules");
    const rootNodeModules = path.resolve(__dirname, "../../node_modules");

    // Helper to find legacy module (for backward compatibility).
    // Only returns a path when it exists; otherwise undefined so we don't alias to missing paths (avoids MODULE_NOT_FOUND on Vercel).
    const findLegacyModule = (
      packageName: string,
      moduleName: string,
    ): string | undefined => {
      const appPath = path.resolve(appNodeModules, packageName, moduleName);
      const rootPath = path.resolve(rootNodeModules, packageName, moduleName);
      if (fs.existsSync(appPath)) return appPath;
      if (fs.existsSync(rootPath)) return rootPath;
      return undefined;
    };

    // Add node_modules to resolve.modules so primereact can be resolved from root in monorepo (npm on Vercel).
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      appNodeModules,
      rootNodeModules,
      "node_modules",
    ];

    config.resolve.symlinks = true;

    // Legacy aliases only when paths exist; otherwise resolution uses resolve.modules above.
    const legacyAliases: Record<string, string> = {};
    const primereactSubmodules = [
      "column",
      "datatable",
      "button",
      "api",
      "card",
      "inputtext",
      "paginator",
      "speeddial",
      "tooltip",
      "badge",
    ];
    for (const name of primereactSubmodules) {
      const target = findLegacyModule("primereact", name);
      if (target) legacyAliases[`primereact/${name}`] = target;
    }
    config.resolve.alias = { ...config.resolve.alias, ...legacyAliases };

    return config;
  },
};

export default nextConfig;
