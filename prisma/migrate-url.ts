const localMigrateUrl =
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable";

/**
 * Migrations usam a conexão direta. O app em runtime continua na DATABASE_URL
 * (pooler). `pgbouncer` não entra aqui: o adapter não lê esse parâmetro.
 */
export function migrateDatabaseUrl(
  env: {
    MIGRATE_DATABASE_URL?: string;
    DIRECT_URL?: string;
    DATABASE_URL?: string;
  } = {
    MIGRATE_DATABASE_URL: process.env.MIGRATE_DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  },
) {
  return (
    env.MIGRATE_DATABASE_URL?.trim() ||
    env.DIRECT_URL?.trim() ||
    env.DATABASE_URL?.trim() ||
    localMigrateUrl
  );
}
