import path from "node:path";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config({ path: path.join(__dirname, ".env") });

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    // DIRECT_URL: pgbouncer 풀링 없이 직접 연결 (prisma migrate deploy용)
    // Supabase Settings > Database > Connection string (URI)
    directUrl: process.env.DIRECT_URL,
  },
});
