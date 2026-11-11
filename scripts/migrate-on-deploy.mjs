// Roda `prisma migrate deploy` nos builds de Production e Preview da Vercel, antes do `next build`.
// Fora deles (CI, build local, VERCEL_ENV=development) não abre conexão com banco nenhum.
// Nunca escreve a URL, o usuário, a senha ou o host do banco no log.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { createInterface } from "node:readline";
import { pathToFileURL } from "node:url";

const transactionPoolerPort = "6543";

/** Ambientes da Vercel em que o build aplica as migrations. */
const migratingEnvironments = new Set(["production", "preview"]);

/** @param {string} vercelEnv */
function environmentLabel(vercelEnv) {
  return vercelEnv === "production" ? "Production" : "Preview";
}

/**
 * Decide o que o build faz com as migrations.
 * @param {Record<string, string | undefined>} env
 * @returns {{ action: "skip", reason: string } | { action: "error", message: string } | { action: "migrate", url: string, vercelEnv: string }}
 */
export function planDeployMigration(env) {
  const vercelEnv = env.VERCEL_ENV?.trim() ?? "";
  if (!migratingEnvironments.has(vercelEnv)) {
    return {
      action: "skip",
      reason: `VERCEL_ENV=${vercelEnv || "(ausente)"}: migrations ignoradas, nenhum banco é acessado.`,
    };
  }

  const label = environmentLabel(vercelEnv);
  const url = env.MIGRATE_DATABASE_URL?.trim() || env.DIRECT_URL?.trim();
  if (!url) {
    return {
      action: "error",
      message: `Build de ${label} sem DIRECT_URL nem MIGRATE_DATABASE_URL. Defina uma delas na Vercel (${label}) com a conexão de sessão do pooler do Supabase (porta 5432, sslmode=require). A DATABASE_URL (pooler de transação, porta 6543) não é usada para migrations.`,
    };
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return {
      action: "error",
      message: "DIRECT_URL/MIGRATE_DATABASE_URL não é uma URL válida do Postgres.",
    };
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    return {
      action: "error",
      message: "DIRECT_URL/MIGRATE_DATABASE_URL precisa começar com postgresql://.",
    };
  }

  if (parsed.port === transactionPoolerPort) {
    return {
      action: "error",
      message:
        "DIRECT_URL/MIGRATE_DATABASE_URL aponta para a porta 6543 (pooler de transação). Use a conexão de sessão do pooler, na porta 5432.",
    };
  }

  return { action: "migrate", url, vercelEnv };
}

/**
 * Troca por *** tudo o que identifica o banco: a URL inteira, usuário, senha e host.
 * @param {string} text
 * @param {string} url
 */
export function redactDatabaseUrl(text, url) {
  const secrets = new Set([url]);
  try {
    const parsed = new URL(url);
    for (const value of [parsed.password, parsed.username, parsed.hostname, parsed.host]) {
      if (!value) continue;
      secrets.add(value);
      try {
        secrets.add(decodeURIComponent(value));
      } catch {
        // valor sem escape válido: fica só a forma original
      }
    }
  } catch {
    // URL inválida: só a string inteira é escondida
  }

  let output = text;
  for (const secret of [...secrets].sort((a, b) => b.length - a.length)) {
    if (secret.length < 3) continue;
    output = output.split(secret).join("***");
  }

  return output.replace(/postgres(?:ql)?:\/\/\S+/gi, "postgresql://***");
}

/**
 * @param {string} url
 * @param {Record<string, string | undefined>} env
 * @returns {Promise<number>}
 */
function runMigrateDeploy(url, env) {
  const require = createRequire(import.meta.url);
  const prismaCli = require.resolve("prisma/build/index.js");

  return new Promise((resolve) => {
    const child = spawn(process.execPath, [prismaCli, "migrate", "deploy"], {
      // O prisma7.config.ts lê MIGRATE_DATABASE_URL antes de DIRECT_URL e DATABASE_URL.
      env: { ...env, MIGRATE_DATABASE_URL: url },
      stdio: ["ignore", "pipe", "pipe"],
    });

    for (const [stream, target] of [
      [child.stdout, process.stdout],
      [child.stderr, process.stderr],
    ]) {
      createInterface({ input: stream }).on("line", (line) => {
        target.write(`${redactDatabaseUrl(line, url)}\n`);
      });
    }

    child.on("error", () => resolve(1));
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function main() {
  const plan = planDeployMigration(process.env);

  if (plan.action === "skip") {
    console.log(`[migrate-on-deploy] ${plan.reason}`);
    return 0;
  }

  if (plan.action === "error") {
    console.error(`[migrate-on-deploy] ${plan.message}`);
    return 1;
  }

  console.log(`[migrate-on-deploy] VERCEL_ENV=${plan.vercelEnv}: rodando prisma migrate deploy.`);
  const code = await runMigrateDeploy(plan.url, process.env);
  if (code !== 0) {
    console.error(
      `[migrate-on-deploy] prisma migrate deploy falhou (código ${code}). O build para aqui e a Vercel não publica esta versão.`,
    );
    return code;
  }

  console.log("[migrate-on-deploy] Migrations em dia.");
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((code) => {
    process.exitCode = code;
  });
}
