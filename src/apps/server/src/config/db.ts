import { config } from "dotenv";
import pg, { Pool, type QueryResultRow } from "pg";

// .env.local (gitignored, machine-specific) overrides .env when present
config();
config({ path: ".env.local", override: true });

// connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// exporting query method

interface DatabaseClient {
  query: <T extends QueryResultRow>(
    query: string,
    params?: unknown[],
  ) => Promise<pg.QueryResult<T>>;
}

const db: DatabaseClient = {
  query: <T extends QueryResultRow>(query: string, params?: unknown[]) =>
    pool.query<T>(query, params),
};

export default db;
