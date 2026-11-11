import { config } from "dotenv";
import pg from "pg";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const localAdminUrl = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const name = "nix_shadow";

function adminConnectionString() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return localAdminUrl;

  const url = new URL(raw);
  if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
    throw new Error(
      "O banco de sombra só é criado no Postgres local. DATABASE_URL aponta para outro host.",
    );
  }

  url.pathname = "/postgres";
  url.searchParams.delete("pgbouncer");
  return url.toString();
}

async function main() {
  const client = new pg.Client({ connectionString: adminConnectionString() });
  await client.connect();

  const found = await client.query("select 1 from pg_database where datname = $1", [name]);
  if (found.rowCount === 0) {
    await client.query(`create database ${name}`);
  }

  await client.end();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Não foi possível criar o banco de sombra.");
  process.exit(1);
});
