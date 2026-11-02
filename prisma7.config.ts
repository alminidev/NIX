import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --conditions=react-server --import tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable",
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
      : {}),
  },
});
