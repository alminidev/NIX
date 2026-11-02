import assert from "node:assert/strict";
import { describe, it } from "node:test";

try {
  process.loadEnvFile(".env");
} catch {
  // sem .env: tenta o arquivo local abaixo
}

try {
  process.loadEnvFile(".env.local");
} catch {
  // sem .env.local
}

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe(
  "RLS no schema public",
  { skip: !hasDatabase && "DATABASE_URL not set" },
  () => {
    it("deixa toda tabela do public com RLS ligado", async () => {
      const { prisma } = await import("../src/lib/prisma");
      const rows = await prisma.$queryRaw<Array<{ relname: string }>>`
        select c.relname
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relkind = 'r'
          and c.relrowsecurity = false
        order by c.relname
      `;

      assert.deepEqual(
        rows.map((row) => row.relname),
        [],
      );
    });
  },
);
