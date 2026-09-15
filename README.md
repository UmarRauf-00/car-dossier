# Car Dossier

A full-stack app for looking up vehicle manufacturer, make, and model data, with per-user favorites. Users search for a manufacturer, browse its makes and models (data sourced live from the [NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/)), and, once signed in via [Clerk](https://clerk.com/), can favorite manufacturers for later.

Built as a pnpm monorepo: a React/Vite client and an Express + GraphQL server, containerized with Docker.

## Notable decisions

- **GraphQL as an aggregation layer over a third-party REST API.** The server doesn't own the vehicle data; NHTSA does. GraphQL resolvers (`src/apps/server/src/resolvers.ts`) proxy and reshape NHTSA's `vehicles/GetMakeForManufacturer` and `GetModelsForMakeId` endpoints into a typed schema, while the `users`/`updateUserFavorites` operations hit local Postgres in the same query. That lets the client ask for both external and internal data in one round trip (see the `@include(if: $isSignedIn)` directive in [`DisplayAllMakes.tsx`](src/apps/client/src/components/searchTabs/DisplayAllMakes.tsx), which skips the users lookup entirely for anonymous visitors).
- **Webhook-driven user sync instead of a signup form.** Rather than building and validating our own registration flow, Clerk owns identity and pushes `user.created`/`user.updated` events to `POST /webhooks/clerk` ([`index.ts`](src/apps/server/src/index.ts)), which upserts into the local `users` table. That route is registered before the global JSON body parser because Clerk's webhook signature verification needs the raw request body.
- **Optimistic, debounced favoriting.** Checking a favorite updates local state immediately and fires the `updateUserFavorites` mutation 500ms later (debounced, and skipped on first render) rather than on every click, a small UX/network tradeoff made explicit in [`DisplayAllMakes.tsx`](src/apps/client/src/components/searchTabs/DisplayAllMakes.tsx).
- **Multi-stage, non-root Docker builds.** `Dockerfile.backend` and `Dockerfile.frontend` each build in one stage and ship only the compiled output in a slim runner stage, running as the non-root `node` user. The frontend build args (`VITE_*`) get passed in at build time, not runtime, since Vite inlines them into the static bundle. `docker-compose.yml` wires in Postgres health checks so the server doesn't start against a database that isn't ready yet.

## Architecture

```
src/apps/
├── client/   React 19 + Vite + React Router + MUI + Apollo Client + Clerk
└── server/   Express + Apollo Server (GraphQL) + pg + Clerk (webhook verification)
```

**Server** (`src/apps/server/src`)
- `index.ts`: the Express app. Mounts Apollo GraphQL at `/graphql`, a Clerk webhook at `/webhooks/clerk`, a couple of legacy REST routes (`GET /api/users`, `POST /api/addUser`, not currently called by the client), and a `/ready` health check.
- `schema.ts` / `resolvers.ts`: GraphQL schema and resolvers, described above.
- `config/db.ts`: the `pg` connection pool, configured via `DATABASE_URL`.

**Client** (`src/apps/client/src`)
- `main.tsx`: sets up `ClerkProvider` → `ApolloProvider` → MUI `ThemeProvider`, and routes (`/`, `/makeDetails/:makeId`).
- `components/searchTabs/`: the core flow, `SearchByName` → `DisplayAllMakes` (results + favoriting) → `GetDetailsByMakeID` → `DisplayDetailsForMake` (models table). A "By Make & Year" tab and VIN search exist as stubs but are currently commented out of the UI.
- `components/AuthBar.tsx`: sign-in/sign-up buttons and user menu.

**Database**: one table, `users` (`init-db/01-create-users.sql`), with columns `clerk_user_id`, `email_address`, `first_name`, `last_name`, `favorite_manufactures` (text array).

## Tech stack

React 19 · Vite · React Router · MUI · Apollo Client · Node.js · Express · Apollo Server (GraphQL) · PostgreSQL (`pg`) · Clerk · Docker / Docker Compose · TypeScript · ESLint

## Running it locally

```bash
pnpm install
docker compose -f docker-compose.dev.yml up postgres   # Postgres + users table
pnpm dev                                                 # server + client, concurrently
```

The server (`src/apps/server`) needs a `.env`/`.env.local` with `DATABASE_URL`, `SERVER_PORT`, `CLIENT_ORIGIN`, and Clerk's `CLERK_SECRET_KEY` / webhook signing secret. The client needs `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_SERVER_PORT` (or `VITE_GRAPHQL_URL` to point at a non-localhost API). See `src/apps/server/src/helpers/const.ts` and `src/apps/client/src/helpers/const.ts` for the exact variables each app reads.

A full production path also exists via `docker compose up --build` (`docker-compose.yml`), building the client and server as separate containers.

## What I'd improve next

- No automated tests yet (`server`'s `test` script is a stub); this would be the first thing I'd add.
- A couple of `console.log` debug statements are still in the resolvers and `DisplayAllMakes`/`DisplayDetailsForMake`. Fine for a project at this stage, but I'd clean those up before calling it production-ready.
- The `GET /api/users` / `POST /api/addUser` REST routes predate the GraphQL `users` query and mutation and aren't called by the client anymore, so they're candidates for removal.
- "Search by Make & Year" and VIN search are scaffolded (`SearchByMakeAndYear.tsx`, `DisplayAllCarsByVIN.tsx`) but not wired into the UI yet.
