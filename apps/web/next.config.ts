import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@spelltrace/shared"],
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
