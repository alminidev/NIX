import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ['pg', '@prisma/adapter-pg'],
};

export default nextConfig;
