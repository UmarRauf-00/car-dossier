import express, { type Express } from "express";
import { ApolloServer, type BaseContext } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

import cors from "cors";
import { port } from "./helpers/const";

const app: Express = express();

// Middleware to parse json
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173" }));

const server = new ApolloServer<BaseContext>({
  typeDefs,
  resolvers,
});

async function startServer() {
  await server.start();
  app.use("/graphql", expressMiddleware(server));
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
