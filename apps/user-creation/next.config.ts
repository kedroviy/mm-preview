import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mm-preview/ui", "@mm-preview/sdk"],
};

export default nextConfig;

