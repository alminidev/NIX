import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { migrateDatabaseUrl } from "./prisma/migrate-url";

// Na Vercel as variáveis vêm do painel. Os arquivos .env são só do
// desenvolvimento e não podem trocar a URL que o build escolheu.
if (!process.env.VERCEL_ENV) {
  config({ path: ".env" });
  config({ path: ".env.local", override: true });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --conditions=react-server --import tsx prisma/seed.ts",
  },
  datasource: {
    url: migrateDatabaseUrl(),
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
      : {}),
  },
});
