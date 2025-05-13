// eslint-disable-next-line no-var

import { PrismaClient } from "@prisma/client";

declare global {
  // `prisma`를 `let`으로 변경하여 타입 정의를 안전하게 사용
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
