import pg from "pg";

const adminUrl = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const name = "nix_shadow";

async function main() {
  const client = new pg.Client({ connectionString: adminUrl });
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
