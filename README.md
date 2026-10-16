# Car Dossier

Look up a US vehicle's safety record and ask an AI assistant about it.

**Live demo:** https://car-dossier.omarr.dev

Clerk auth is in dev mode to enable user to try it without creating a real account.
Sign up with any email containing `+clerk_test` (e.g. `demo+clerk_test@example.com`) and enter `424242` as the verification code and it'll log you in.

![App Screenshot](/public/car-dossier-app-ss.png)

## What it does

- Search for a car manufacturer (e.g. 'Honda') and drill down to a model and year. Each car has a report with its recalls, owner complaints and safety ratings. All data comes from NHTSA, the US government's vehicle safety agency.
- An AI car advisor (Claude) answers questions about the car you're looking at, mainly from that car's NHTSA data. It also suggests a few questions to start with.
- Clerk handles sign up and sign in. A Clerk webhook adds new users to Postgres, and favourite manufacturers are saved against the user's Clerk ID.

## Tech stack

- **Client:** React, TypeScript, Vite, MUI, Apollo Client
- **Server:** Node.js, Express, Apollo Server (GraphQL), Anthropic SDK
- **Data and services:** PostgreSQL (`pg`), NHTSA APIs, Clerk, Claude API
- **Tooling:** pnpm workspaces, Docker / Docker Compose
- **Hosting:** Railway (client, API and Postgres), deployed from GitHub

## Architecture

![Architecture diagram](/public/artitechture_diagram.png)

## Key decisions

- **GraphQL as a BFF:** the server combines NHTSA's REST APIs and Postgres into one GraphQL schema, so each page asks for only the data it needs.
- **Clerk for auth:** pre-built sign-up, sign-in and profile components, plus Google, GitHub and Discord sign-in so users can quickly create an account. For a personal project, that meant not spending time configuring a complex auth system.
- **AI car advisor limited to one car:** the server puts the car's NHTSA data in the system prompt and tells Claude to only answer questions about that car, so it can't be used as a general chatbot.
  - **Chat history sent with each request:** the API doesn't remember past messages, so the client sends the recent conversation every time.
  - **Temperature 0.7:** for more consistent, less random answers.
  - **No web search:** keeps answers focused on the car's NHTSA data, and avoids per-search costs on a public endpoint that doesn't require sign-in.

## Running it locally

You'll need Node.js 22, pnpm and Docker, plus a Clerk publishable key (the app won't load without one).

An Anthropic API key is optional. Without it, everything works except the AI car advisor. Both keys go in the `.env.local` files from step 2.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up environment variables. Each `.example.env` lists what's needed:

   ```bash
   cp .example.env .env                                         # Docker Compose (Postgres)
   cp src/apps/server/.example.env src/apps/server/.env.local   # API: database URL (localhost:5431 with Docker), Anthropic key, Clerk webhook secret
   cp src/apps/client/.example.env src/apps/client/.env.local   # Client: Clerk publishable key, server port
   ```

3. Start Postgres:

   ```bash
   docker compose -f docker-compose.dev.yml up postgres
   ```

4. Run the client and server together:

   ```bash
   pnpm dev
   ```

   The client runs on http://localhost:5173.

## Project structure

```
src/apps/client   React app
src/apps/server   Express + GraphQL API, AI advisor routes, Clerk webhook
init-db           SQL that runs when the Postgres container is first created
```

## Deployment

The client, API and Postgres run as three services on Railway. Each push to `master` deploys automatically from GitHub.
