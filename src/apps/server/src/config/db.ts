import "dotenv/config";
import pg, { Pool, type QueryResultRow } from "pg";

// connection setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

// exporting query method

interface DatabaseClient {
  query: <T extends QueryResultRow>(
    text: string,
    params?: unknown[],
  ) => Promise<pg.QueryResult<T>>;
}

const db: DatabaseClient = {
  query: <T extends QueryResultRow>(text: string, params?: unknown[]) =>
    pool.query<T>(text, params),
};

export default db;
