import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";

import prisma from "@/db";

const DEMO_USER_EMAIL = "demo@woowa-eats.local";
const DEMO_USER_NAME = "체험용 데모 계정";
const DEMO_USER_IMAGE = "/images/markers/user.png";

export const authOption: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
    updateAge: 60 * 60 * 2,
  },

  adapter: PrismaAdapter(prisma as never),
  providers: [
    CredentialsProvider({
      id: "demo",
      name: "데모 체험",
      credentials: {},
      async authorize() {
        const existingUser = await prisma.user.findUnique({
          where: { email: DEMO_USER_EMAIL },
        });

        if (existingUser) {
          return {
            id: String(existingUser.id),
            email: existingUser.email ?? DEMO_USER_EMAIL,
            name: existingUser.name ?? DEMO_USER_NAME,
            image: existingUser.image ?? DEMO_USER_IMAGE,
            role: existingUser.role,
          };
        }

        const demoUser = await prisma.user.create({
          data: {
            email: DEMO_USER_EMAIL,
            name: DEMO_USER_NAME,
            image: DEMO_USER_IMAGE,
            emailVerified: new Date(),
            role: "DEMO",
          },
        });

        return {
          id: String(demoUser.id),
          email: demoUser.email ?? DEMO_USER_EMAIL,
          name: demoUser.name ?? DEMO_USER_NAME,
          image: demoUser.image ?? DEMO_USER_IMAGE,
          role: demoUser.role,
        };
      },
    }),


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
    }),
  ],
  pages: {
    signIn: "/users/login",
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: Number(token.sub),
        role: (token.role as "USER" | "DEMO" | "ADMIN" | undefined) ?? "USER",
      },
    }),
    jwt: async ({ user, token }) => {
      if (user?.id) {
        token.sub = String(user.id);
      }

      if (user && "role" in user) {
        token.role = user.role;
      }

      if (!token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(token.sub) },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "USER";
      }

      return token;
    },
  },
};

export default NextAuth(authOption);
