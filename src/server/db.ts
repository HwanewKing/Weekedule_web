import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter, log: ["error"] });
}

// Delay Prisma client creation until the first real DB access.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }

    const target = globalForPrisma.prisma;
    const value = (target as unknown as Record<string, unknown>)[prop];
    return typeof value === "function" ? value.bind(target) : value;
  },
});
