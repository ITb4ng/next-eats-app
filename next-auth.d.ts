import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

type UserRole = "USER" | "DEMO" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: number;
      email: string;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}
