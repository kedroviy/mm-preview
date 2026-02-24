/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mm-preview/ui", "@mm-preview/sdk"],
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL || "https://mm-admin.onrender.com";
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
