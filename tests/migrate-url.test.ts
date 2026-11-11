import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { migrateDatabaseUrl } from "../prisma/migrate-url";

describe("URL de migration", () => {
  it("prefere MIGRATE_DATABASE_URL, depois DIRECT_URL, e por último DATABASE_URL", () => {
    const direct = "postgresql://direct/db?sslmode=require";
    const migrate = "postgresql://migrate/db?sslmode=require";
    const pooled = "postgresql://pooler/db?sslmode=require";

    assert.equal(
      migrateDatabaseUrl({
        MIGRATE_DATABASE_URL: migrate,
        DIRECT_URL: direct,
        DATABASE_URL: pooled,
      }),
      migrate,
    );
    assert.equal(
      migrateDatabaseUrl({ DIRECT_URL: direct, DATABASE_URL: pooled }),
      direct,
    );
    assert.equal(migrateDatabaseUrl({ DATABASE_URL: pooled }), pooled);
  });

  it("ignora variável em branco", () => {
    assert.equal(
      migrateDatabaseUrl({
        MIGRATE_DATABASE_URL: "  ",
        DIRECT_URL: "postgresql://direct/db?sslmode=require",
      }),
      "postgresql://direct/db?sslmode=require",
    );
  });
});
