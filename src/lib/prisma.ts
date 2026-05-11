import { PrismaClient } from "@/generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

function getPrismaInstance(): PrismaClient {
  if (global._prisma) return global._prisma;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = new (PrismaClient as any)();
  if (process.env.NODE_ENV !== "production") {
    global._prisma = client;
  }
  return client;
}

// Proxy-based lazy initialization: Prisma is only instantiated on first method call,
// not at module import time. This prevents build-time failures when DATABASE_URL is unset.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrismaInstance()[prop as keyof PrismaClient];
  },
});
