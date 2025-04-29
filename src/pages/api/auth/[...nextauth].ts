import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
// import { PrismaClient } from "@prisma/client"
import GoogleProvider from "next-auth/providers/google"
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";

import prisma from "@/db";

// const prisma = new PrismaClient();


export const authOption = {
  session:{
    strategy: "jwt" as const,
    maxAge : 60 * 60 * 24, //세션 최대 수명 24h
    updateAge : 60 * 60 * 2, // 업데이트 주기 2h
  },
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        
    }),
    NaverProvider({
        clientId: process.env.NAVER_CLIENT_ID || "",
        clientSecret: process.env.NAVER_CLIENT_SECRET || "",
    }),
    KakaoProvider({
        clientId: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
    })
  ],
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/users/login",
  }
};

export default NextAuth(authOption);