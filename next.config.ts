import type { NextConfig } from "next";

function supabaseProductImages() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return [];

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return [];

    return [
      {
        protocol: url.protocol.slice(0, -1) as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/storage/v1/object/public/produtos/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  images: {
    remotePatterns: supabaseProductImages(),
    // O Storage local fica em 127.0.0.1. O otimizador bloqueia IP local;
    // a liberação vale só no `next dev`.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    // Nome novo a cada troca, então a foto otimizada pode ficar em cache.
    minimumCacheTTL: 2_678_400,
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
  },
};

export default nextConfig;
