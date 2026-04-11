import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// 빌드 타임에 인스턴스를 생성하지 않도록 lazy proxy 사용
// 실제 DB 쿼리가 실행될 때(런타임)만 PrismaClient를 초기화
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
