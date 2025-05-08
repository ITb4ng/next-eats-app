import NextAuth, {NextAuthOptions} from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";

import prisma from "@/db";



export const authOption: NextAuthOptions = {
  session:{
    strategy: "jwt" as const,
    maxAge : 60 * 60 * 24, //세션 최대 수명 24h
    updateAge : 60 * 60 * 2, // 업데이트 주기 2h
  },
  adapter: PrismaAdapter(prisma),

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
        clientId: process.env.KAKAO_CLIENT_ID || "",
        clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
        allowDangerousEmailAccountLinking: true,
    })
  ],
  pages: {
    signIn: "/users/login",
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
    jwt: async ({ user, token }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};


export default NextAuth(authOption);