import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getDbPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  return pool;
}

export async function queryDb<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  const db = getDbPool();

  if (!db) {
    throw new Error("DATABASE_URL is not set.");
  }

  return db.query<T>(text, params);
}
