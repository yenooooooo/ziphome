import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // VWorld API 프록시 — CORS 우회 + Edge 리전에서 처리
        source: "/api/vworld/:path*",
        destination: "https://api.vworld.kr/:path*",
      },
    ];
  },
};

export default nextConfig;
