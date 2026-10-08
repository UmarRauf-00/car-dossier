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
  const { userQuestion, vehicleData, history } = req.body;

  // Earlier turns of the chat. The API is stateless, so Claude only "remembers"
  // what we send. Keep valid user/assistant text turns, capped to the last 20.
  const previousMessages: Anthropic.MessageParam[] = (
    Array.isArray(history) ? history : []
  )
    .filter(
      (m) =>
        (m?.role === "user" || m?.role === "assistant") &&
        typeof m?.content === "string",
    )
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-20);

  // The conversation must start with a user turn
  while (previousMessages[0]?.role === "assistant") previousMessages.shift();

  try {
    const message = await anthropicClient.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: `You are a car research assistant specialising in vehicle reliability, common issues, and buying advice.
      You have access to the following vehicle data from NHTSA:
      <vehicle_data>
      ${JSON.stringify(vehicleData, null, 2)}
      </vehicle_data>
      Use this data as your primary source. For questions not covered by it, draw on your general knowledge about this vehicle. Only answer questions related to this vehicle — if asked anything unrelated, respond: "I can only help with questions about this vehicle."
              Response style:
      - Plain, conversational English. No marketing language or filler.
      - Keep answers under 80 words unless asked for detail.
      - No markdown headings; short bullet points only when listing.

      Role and Style Instructions:
      - You are a direct, pragmatic human professional. Your primary directive is to eliminate conversational bloat and keep text tightly bounded.

      Structure & Conciseness (Anti-Bloat Rules):
      - Cut the No-Ops: Do not include introductory acknowledgements ("Sure, I can help with that", "Based on your request..."). Jump straight to the first word of the response.
      - No Redundant Echoing: Do not restate, rephrase, or summarize what I just told you. Assume I remember what I wrote.
      - Single-Pass Information: Provide the answer once. Do not give the answer and then immediately explain what you just gave me unless explicitly asked.
      - Extreme Economy: Treat tokens as expensive. Use 20 words instead of 200 wherever possible. Stop writing the moment the core task is completed.
      `,
      messages: [...previousMessages, { role: "user", content: userQuestion }],
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

// Suggested starter questions for the chat, based on the current vehicle data.
// Structured outputs guarantee the reply is JSON matching the schema.
app.post("/api/anthropic_suggestions", async (req: Request, res: Response) => {
  const { vehicleData } = req.body;

  try {
    const message = await anthropicClient.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: `You are a car research assistant. Given this vehicle data from NHTSA:
        <vehicle_data>
        ${JSON.stringify(vehicleData, null, 2)}
        </vehicle_data>
        Suggest 3 short, specific questions (under 12 words each) a car buyer might ask about this data.`,

      messages: [{ role: "user", content: "Suggest questions." }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              questions: { type: "array", items: { type: "string" } },
            },
            required: ["questions"],
            additionalProperties: false,
          },
        },
      },
    });

    const text = message.content.find((b) => b.type === "text");
    const { questions } = JSON.parse(text?.type === "text" ? text.text : "{}");
    res.json({ questions: questions ?? [] });
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("Error getting suggestions:", e.message);
    }
    res.status(500).json({ error: "Error getting suggestions" });
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
