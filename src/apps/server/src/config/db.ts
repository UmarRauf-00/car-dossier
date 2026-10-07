import pg, { Pool, type QueryResultRow } from "pg";

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
