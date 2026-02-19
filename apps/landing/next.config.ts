import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

const nextConfig: NextConfig = {
  transpilePackages: ["@mm-preview/ui", "@mm-preview/sdk"],
  experimental: {
    optimizePackageImports: ["primereact"],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "https://mm-admin.onrender.com";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // For pnpm, we need to ensure modules are resolved correctly
    // pnpm uses symlinks and a different node_modules structure
    const appNodeModules = path.resolve(__dirname, "node_modules");
    const rootNodeModules = path.resolve(__dirname, "../../node_modules");
    
    // Helper to find primereact module
    const findPrimeReactModule = (moduleName: string) => {
      const appPath = path.resolve(appNodeModules, "primereact", moduleName);
      const rootPath = path.resolve(rootNodeModules, "primereact", moduleName);
      
      // Check if exists, return the first found
      if (fs.existsSync(appPath)) {
        return appPath;
      }
      if (fs.existsSync(rootPath)) {
        return rootPath;
      }
      // Return app path anyway - webpack will handle the error
      return appPath;
    };
    
    // Add node_modules to resolve.modules so webpack can find primereact
    // This works for both npm and pnpm
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      appNodeModules,
      rootNodeModules,
      "node_modules", // Default webpack resolution
    ];
    
    // For pnpm, we need to ensure symlinks are followed
    config.resolve.symlinks = true;
    
    // Ensure webpack can resolve primereact modules from the app's node_modules
    // This is critical for monorepo setups where packages/ui imports primereact
    config.resolve.alias = {
      ...config.resolve.alias,
      // Explicitly resolve primereact modules to ensure they're found
      "primereact/animateonscroll": findPrimeReactModule("animateonscroll"),
      "primereact/avatar": findPrimeReactModule("avatar"),
      "primereact/button": findPrimeReactModule("button"),
      "primereact/badge": findPrimeReactModule("badge"),
    };
    
    return config;
  },
};

export default nextConfig;
