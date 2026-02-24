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
  webpack: (config, { isServer }) => {
    // For pnpm, we need to ensure modules are resolved correctly
    // pnpm uses symlinks and a different node_modules structure
    const appNodeModules = path.resolve(__dirname, "node_modules");
    const rootNodeModules = path.resolve(__dirname, "../../node_modules");

    // Helper to find legacy module (for backward compatibility)
    const findLegacyModule = (packageName: string, moduleName: string) => {
      const appPath = path.resolve(appNodeModules, packageName, moduleName);
      const rootPath = path.resolve(rootNodeModules, packageName, moduleName);

      if (fs.existsSync(appPath)) {
        return appPath;
      }
      if (fs.existsSync(rootPath)) {
        return rootPath;
      }
      return appPath;
    };

    // Add node_modules to resolve.modules
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      appNodeModules,
      rootNodeModules,
      "node_modules",
    ];

    // For pnpm, we need to ensure symlinks are followed
    config.resolve.symlinks = true;

    // Legacy module resolution (for backward compatibility with old components)
    config.resolve.alias = {
      ...config.resolve.alias,
      // Legacy components still use these modules
      "primereact/animateonscroll": findLegacyModule(
        "primereact",
        "animateonscroll",
      ),
      "primereact/avatar": findLegacyModule("primereact", "avatar"),
      "primereact/button": findLegacyModule("primereact", "button"),
      "primereact/badge": findLegacyModule("primereact", "badge"),
    };

    return config;
  },
};

export default nextConfig;
