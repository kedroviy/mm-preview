import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mm-preview/ui", "@mm-preview/sdk"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://mm-admin.onrender.com/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
