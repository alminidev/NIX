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
  it("não toca no banco fora de VERCEL_ENV=production", () => {
    for (const VERCEL_ENV of [undefined, "", "preview", "development", "Production"]) {
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
      { action: "migrate", url: migrate },
    );
    assert.deepEqual(
      planDeployMigration({
        VERCEL_ENV: "production",
        MIGRATE_DATABASE_URL: "  ",
        DIRECT_URL: session,
      }),
      { action: "migrate", url: session },
    );
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

  it("Preview com URLs de produção sai com 0 sem chamar o Prisma", () => {
    const result = runScript({
      VERCEL_ENV: "preview",
      DATABASE_URL: transaction,
      DIRECT_URL: session,
    });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /migrations ignoradas/);
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
    const result = runScript({ VERCEL_ENV: "production", DIRECT_URL: unreachable });
    const output = `${result.stdout}${result.stderr}`;
    assert.notEqual(result.status, 0);
    assert.match(output, /migrate deploy falhou/);
    for (const secret of ["usuario_secreto", "senha-secreta", "127.0.0.1"]) {
      assert.ok(!output.includes(secret), `${secret} vazou: ${output}`);
    }
  });
});
