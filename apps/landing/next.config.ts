import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@mm-preview/ui"],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  /** Lighthouse «Missing source maps» для крупных first-party чанков. */
  productionBrowserSourceMaps: true,
  transpilePackages: ["@mm-preview/ui"],
  async headers() {
    const base: { key: string; value: string }[] = [
      { key: "X-Frame-Options", value: "DENY" },
      /** Без COOP: `same-origin` мешает back/forward cache в Chrome на мобильных навигациях. */
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];
    if (
      process.env.VERCEL === "1" ||
      process.env.LANDING_FORCE_HSTS === "true"
    ) {
      base.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }
    return [{ source: "/:path*", headers: base }];
  },
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL || "https://movie-api.moviematch.space";
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

    // Add node_modules to resolve.modules
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      appNodeModules,
      rootNodeModules,
      "node_modules",
    ];

    // For pnpm, we need to ensure symlinks are followed
    config.resolve.symlinks = true;

    return config;
  },
};

export default nextConfig;
