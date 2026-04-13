import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다");
  }
  // Runtime uses Accelerate extension; cast to PrismaClient for correct TS type inference
  return new PrismaClient({
    log: ["error"],
    datasourceUrl: url,
  }).$extends(withAccelerate()) as unknown as PrismaClient;
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
