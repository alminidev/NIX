import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import {
  planDeployMigration,
  redactDatabaseUrl,
} from "../scripts/migrate-on-deploy.mjs";

const session =
  "postgresql://postgres.abcref:s3nh4-forte@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require";
const transaction =
  "postgresql://postgres.abcref:s3nh4-forte@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require";

function runScript(env: Record<string, string>) {
  return spawnSync(process.execPath, ["scripts/migrate-on-deploy.mjs"], {
    env: {
      NODE_ENV: "test",
      PATH: process.env.PATH ?? "",
      HOME: process.env.HOME ?? "",
      ...env,
    },
    encoding: "utf8",
    timeout: 60_000,
  });
}

describe("migrations no build da Vercel", () => {
  it("não toca no banco fora de Production e Preview", () => {
    for (const VERCEL_ENV of [undefined, "", "development", "Production", "Preview"]) {
      const plan = planDeployMigration({
        VERCEL_ENV,
        DATABASE_URL: transaction,
        DIRECT_URL: session,
      });
      assert.equal(plan.action, "skip");
    }
  });

  it("em produção prefere MIGRATE_DATABASE_URL e depois DIRECT_URL", () => {
    const migrate = session.replace("postgres?", "migrate?");
    assert.deepEqual(
      planDeployMigration({
        VERCEL_ENV: "production",
        MIGRATE_DATABASE_URL: migrate,
        DIRECT_URL: session,
        DATABASE_URL: transaction,
      }),
      { action: "migrate", url: migrate, vercelEnv: "production" },
    );
    assert.deepEqual(
      planDeployMigration({
        VERCEL_ENV: "production",
        MIGRATE_DATABASE_URL: "  ",
        DIRECT_URL: session,
      }),
      { action: "migrate", url: session, vercelEnv: "production" },
    );
  });

  it("em Preview roda o migrate com a mesma regra de URL de produção", () => {
    const migrate = session.replace("postgres?", "migrate?");
    assert.deepEqual(
      planDeployMigration({
        VERCEL_ENV: "preview",
        MIGRATE_DATABASE_URL: migrate,
        DIRECT_URL: session,
        DATABASE_URL: transaction,
      }),
      { action: "migrate", url: migrate, vercelEnv: "preview" },
    );
    assert.deepEqual(
      planDeployMigration({ VERCEL_ENV: " preview ", DIRECT_URL: session }),
      { action: "migrate", url: session, vercelEnv: "preview" },
    );
  });

  it("em Preview não cai para a DATABASE_URL e recusa a porta 6543", () => {
    const missing = planDeployMigration({ VERCEL_ENV: "preview", DATABASE_URL: transaction });
    assert.equal(missing.action, "error");
    assert.match(missing.action === "error" ? missing.message : "", /Preview/);

    const pooled = planDeployMigration({ VERCEL_ENV: "preview", DIRECT_URL: transaction });
    assert.equal(pooled.action, "error");
    assert.match(pooled.action === "error" ? pooled.message : "", /6543/);
  });

  it("em produção não cai para a DATABASE_URL", () => {
    const plan = planDeployMigration({
      VERCEL_ENV: "production",
      DATABASE_URL: transaction,
    });
    assert.equal(plan.action, "error");
    assert.match(plan.action === "error" ? plan.message : "", /DIRECT_URL/);
  });

  it("recusa a porta 6543 e URL inválida", () => {
    for (const DIRECT_URL of [transaction, "não é url", "mysql://u:p@h:5432/db"]) {
      const plan = planDeployMigration({ VERCEL_ENV: "production", DIRECT_URL });
      assert.equal(plan.action, "error");
      assert.ok(plan.action === "error" && !plan.message.includes("s3nh4"));
    }
  });

  it("esconde URL, usuário, senha e host no log", () => {
    const line = `Datasource "db" at "aws-0-sa-east-1.pooler.supabase.com:5432" user postgres.abcref pass s3nh4-forte ${session}`;
    const redacted = redactDatabaseUrl(line, session);
    for (const secret of ["s3nh4", "abcref", "pooler.supabase.com", "postgresql://postgres"]) {
      assert.ok(!redacted.includes(secret), `${secret} vazou: ${redacted}`);
    }
  });

  it("build local (sem VERCEL_ENV) sai com 0 sem chamar o Prisma", () => {
    const result = runScript({
      DATABASE_URL: transaction,
      DIRECT_URL: session,
    });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /migrations ignoradas/);
    assert.ok(!`${result.stdout}${result.stderr}`.includes("s3nh4"));
  });

  it("Preview sem DIRECT_URL falha o build", () => {
    const result = runScript({ VERCEL_ENV: "preview", DATABASE_URL: transaction });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Preview sem DIRECT_URL nem MIGRATE_DATABASE_URL/);
    assert.ok(!`${result.stdout}${result.stderr}`.includes("s3nh4"));
  });

  it("produção sem DIRECT_URL falha o build", () => {
    const result = runScript({ VERCEL_ENV: "production", DATABASE_URL: transaction });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /DIRECT_URL nem MIGRATE_DATABASE_URL/);
    assert.ok(!`${result.stdout}${result.stderr}`.includes("s3nh4"));
  });

  it("falha do migrate falha o build e não vaza a URL", () => {
    const unreachable =
      "postgresql://usuario_secreto:senha-secreta@127.0.0.1:1/nix?sslmode=disable&connect_timeout=2";
    for (const VERCEL_ENV of ["production", "preview"]) {
      const result = runScript({ VERCEL_ENV, DIRECT_URL: unreachable });
      const output = `${result.stdout}${result.stderr}`;
      assert.notEqual(result.status, 0);
      assert.match(output, new RegExp(`VERCEL_ENV=${VERCEL_ENV}: rodando`));
      assert.match(output, /migrate deploy falhou/);
      for (const secret of ["usuario_secreto", "senha-secreta", "127.0.0.1"]) {
        assert.ok(!output.includes(secret), `${secret} vazou: ${output}`);
      }
    }
  });
});
