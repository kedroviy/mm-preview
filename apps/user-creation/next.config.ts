import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mm-preview/ui", "@mm-preview/sdk"],
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "https://mm-admin.onrender.com";
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
};

export default nextConfig;
