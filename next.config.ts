import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Docker/Node uses standalone; OpenNext on Workers ignores this path.
  output: "standalone",
  // Cache Components staged rendering hangs on workerd (Error 1101 / "Worker hung").
  // Keep `"use cache"` via experimental.useCache until OpenNext #1318 ships.
  // See: https://github.com/opennextjs/opennextjs-cloudflare/pull/1318
  cacheComponents: false,
  // File tracing often drops pg-cloudflare's workerd entry; include it for OpenNext.
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/pg-cloudflare/dist/**/*",
      "./node_modules/pg-cloudflare/esm/**/*",
    ],
  },
  reactStrictMode: false,
  logging: {
    fetches: { fullUrl: true },
  },
  experimental: {
    useCache: true,
    optimizePackageImports: [],
    scrollRestoration: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars2.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "h3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "cdn.techdiary.dev",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

// Local `next dev` only — calling this during `next build` / Workers Builds
// throws without CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_*.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
