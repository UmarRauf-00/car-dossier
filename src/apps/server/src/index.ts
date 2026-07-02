import express, { type Express, type Response, type Request } from "express";
import { ApolloServer, type BaseContext } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

import cors from "cors";
import { port } from "./helpers/const";
import db from "./config/db";

const app: Express = express();

// Middleware to parse json
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173" }));

// Apollo Server tings
const server = new ApolloServer<BaseContext>({
  typeDefs,
  resolvers,
});

// GET
// Fetches all users
app.get("/api/users", async (_: Request, res: Response) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error fetching items" });
  }
});

// POST
// add a user to the users table
app.post("/api/addUser", async (req: Request, res: Response) => {
  const { first_name, last_name, favorite_manufactures } = req.body;
  try {
    const queryText = `
            INSERT INTO public.users (first_name, last_name, favorite_manufactures)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;

    const result = await db.query(queryText, [
      first_name,
      last_name,
      favorite_manufactures,
    ]);
    res.json(result.rows);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
      return res
        .status(500)
        .json({ error: "POST req failed - " + err.message });
    }
    res.status(500).json({ error: "Server error adding user to users table" });
  }
});

async function startServer() {
  await server.start();
  app.use("/graphql", expressMiddleware(server));
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
