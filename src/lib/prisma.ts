import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

function getPrismaInstance(): PrismaClient {
  if (global._prisma) return global._prisma;
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = new (PrismaClient as any)({ adapter });
  if (process.env.NODE_ENV !== "production") {
    global._prisma = client;
  }
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrismaInstance()[prop as keyof PrismaClient];
  },
});
