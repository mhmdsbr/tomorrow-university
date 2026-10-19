import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'learning.sabermohamad.de',
        pathname: '/**',
      },
      ...(isDev
        ? [
            {
              protocol: 'http' as const,
              hostname: 'localhost',
              port: '3000',
              pathname: '/**',
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;