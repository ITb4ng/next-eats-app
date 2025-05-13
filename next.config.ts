// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com", // Google 로그인 이미지
      "k.kakaocdn.net",            // 카카오 로그인 이미지
      "avatars.githubusercontent.com", // GitHub 로그인 이미지 등
      "ssl.pstatic.net",               // 네이버 기본 프로필
      "phinf.pstatic.net",       
    ],
  },
};

export default nextConfig;
