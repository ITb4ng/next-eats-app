// next.config.ts
import type { NextConfig } from "next";

const faviconCacheHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=0, must-revalidate",
  },
];

const faviconHeaderSources = [
  "/favicon.ico",
  "/favicon.svg",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/site.webmanifest",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
  images: {
    domains: [
      "lh3.googleusercontent.com", // Google 로그인 이미지
      "k.kakaocdn.net",            // 카카오 로그인 이미지
      "avatars.githubusercontent.com", // GitHub 로그인 이미지 등
      "ssl.pstatic.net",               // 네이버 기본 프로필
      "phinf.pstatic.net",       
    ],
  },
  async headers() {
    return [
      {
        source: "/images/markers/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: faviconCacheHeaders,
      },
      ...faviconHeaderSources.slice(1).map((source) => ({
        source,
        headers: faviconCacheHeaders,
      })),
    ];
  },
};

export default nextConfig;
