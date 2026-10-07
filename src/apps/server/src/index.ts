import "./config/env.js";
import express, { type Express, type Response, type Request } from "express";
import { ApolloServer, type BaseContext } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { verifyWebhook } from "@clerk/express/webhooks";
import Anthropic from "@anthropic-ai/sdk";

import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";

import cors from "cors";
import { port, clientOrigin } from "./helpers/const.js";
import db from "./config/db.js";

const anthropicClient = new Anthropic({
  apiKey:
    "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",
});

const app: Express = express();

// Upon a new user Sign-up on Clerk, Clerk will send a POST req to this webhook to add that user to the users table in postgres.
// Clerk webhook signature verification needs the raw body, so this route
// is registered before the global express.json() parser below.
app.post(
  "/webhooks/clerk",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    try {
      const evt = await verifyWebhook(req);

      if (evt.type === "user.created") {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses[0]?.email_address;

        await db.query(
          `INSERT INTO users (clerk_user_id, email_address, first_name, last_name)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (clerk_user_id) DO NOTHING;`,
          [id, email, first_name, last_name],
        );
      }

      if (evt.type === "user.updated") {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses[0]?.email_address;

        await db.query(
          `UPDATE users
           SET email_address = $2, first_name = $3, last_name = $4
           WHERE clerk_user_id = $1;`,
          [id, email, first_name, last_name],
        );
      }

      res.send("Webhook received");
    } catch (err) {
      console.error("Error verifying webhook:", err);
      res.status(400).send("Error verifying webhook");
    }
  },
);

// Middleware to parse json
app.use(express.json());

app.use(cors({ origin: clientOrigin }));

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

// Helper to check critical dependencies like database connections
const checkDependencies = async () => {
  try {
    // Executes a lightweight query to verify the connection
    await db.query("SELECT 1");
    return true;
  } catch (err) {
    if (err instanceof Error) {
      console.error("PostgreSQL connection failed:", err.message);
    }

    return false;
  }
};

// Antropic
app.post("/api/anthropic_insights", async (req: Request, res: Response) => {
  const { userQuestion, vehicleData } = req.body;

  try {
    const message = await anthropicClient.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      system: `You are a car expert. Answer questions using this vehicle data:\n<vehicle_data>\n${JSON.stringify(vehicleData, null, 2)}\n</vehicle_data>`,
      messages: [{ role: "user", content: userQuestion }],
    });

    res.json({ message });
  } catch (e: unknown) {
    if (e instanceof Error) {
      if (typeof userQuestion !== "string" || !userQuestion.trim()) {
        return res.status(400).json({ error: "userQuestion is required" });
      }

      console.error("Error calling Anthropic API:", e.message);
      return res.status(500).json({ error: "Error calling Anthropic API" });
    }
    res.status(500).json({ error: "Unknown error calling Anthropic API" });
  }
});

// Health-Check
app.get("/ready", async (_req: Request, res: Response) => {
  const isReady = await checkDependencies();

  if (isReady) {
    res.status(200).json({ status: "Ready" });
  } else {
    // Service is temporarily unavailable (e.g., DB is connecting)
    res.status(503).json({ status: "Not Ready" });
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
