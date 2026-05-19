// next.config.ts
import type { NextConfig } from "next";

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
        source: "/favicon.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/favicon.svg",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
