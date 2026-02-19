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
    ];
  },
};

export default nextConfig;
