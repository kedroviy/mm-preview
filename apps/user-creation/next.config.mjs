import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mm-preview/ui", "@mm-preview/sdk"],
  webpack(config) {
    const rootNodeModules = path.resolve(configDir, "../../node_modules");
    const reactQueryRoot = path.resolve(
      rootNodeModules,
      "@tanstack/react-query",
    );
    if (fs.existsSync(reactQueryRoot)) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@tanstack/react-query": reactQueryRoot,
      };
    }
    return config;
  },
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL || "https://movie-api.moviematch.space";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
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
};

export default nextConfig;
