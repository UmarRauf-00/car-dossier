# Car Dossier — full project walkthrough

Car Dossier is a React app that talks to **one Node process**. That process is an Express HTTP server. GraphQL is mounted on it at `/graphql`. Clerk lives mostly in the browser; the server only hears from Clerk via a webhook when a user is created or updated.

---

## Why Express *and* GraphQL

They are not two competing APIs. They are two layers.

**Express** owns the HTTP process: listen on a port, CORS, JSON body parsing, health checks, and the Clerk webhook. Anything that is “a URL with a method” is Express.

**GraphQL (Apollo Server)** owns the *app* API the React client uses. The client does not call NHTSA or Postgres. It POSTs GraphQL operations to `/graphql`. Apollo runs the matching resolver.

So:

| Layer | Job |
| --- | --- |
| Browser (React + Apollo Client) | UI, Clerk session, GraphQL queries/mutations |
| Express | HTTP host, webhook, leftover REST, `/ready` |
| Apollo at `/graphql` | Typed API: manufacturers from NHTSA, favourites from Postgres |
| NHTSA | Public vehicle data |
| Postgres | Your users and favourite lists |
| Clerk (cloud) | Sign-up, sign-in, profile, identity |

The README’s “BFF” idea is this: GraphQL sits in front of two backends and reshapes them for the UI. The more explicit “combine NHTSA + DB in one resolver” is still commented out in `resolvers.ts`. What ships today is two queries in **one GraphQL request** (`getMakeForManufacturer` + `users`).

The REST routes `/api/users` and `/api/addUser` are leftover Express. The client never calls them.

---

## How a search actually moves

1. You type “Honda” and submit.
2. `SearchByName` puts `?searchTerm=Honda` in the URL and passes the term down.
3. `DisplayAllMakes` runs a GraphQL query (skipped until Clerk’s `isLoaded` is true).
4. Apollo Client POSTs to `http://localhost:<port>/graphql` (or `VITE_GRAPHQL_URL` in deploy).
5. Express middleware `expressMiddleware(server)` hands the body to Apollo.
6. Resolver `getMakeForManufacturer` fetches  
   `https://vpic.nhtsa.dot.gov/api/vehicles/GetMakeForManufacturer/Honda?format=json`  
   and maps `Make_ID` → `makeId`, etc.
7. If you are signed in, the same query also asks `users(clerkUserId: …)` so Postgres can return `favorite_manufactures`.
8. Heart checkboxes write the **whole** favourite list back with `updateUserFavorites`.

Clicking a make goes to `/makeDetails/:makeId`. That page queries `getModelsForMakeId`, which hits NHTSA `GetModelsForMakeId/{id}`.

---

## Clerk: who talks to whom, what comes back

**The React app talks to Clerk.** The GraphQL API does **not** currently verify a Clerk session. It trusts `clerkUserId` as a GraphQL argument.

### Browser (your app → Clerk)

`main.tsx` wraps the tree in `ClerkProvider` with `VITE_CLERK_PUBLISHABLE_KEY`. That key is public; it identifies the Clerk app, not a user.

`AuthBar` uses Clerk React components:

- **Signed out:** `SignInButton` / `SignUpButton` open Clerk’s hosted UI (modal). The dedicated files `app/routes/sign-in.tsx` and `sign-up.tsx` are **not** registered in the router, so those pages are unused.
- **Signed in:** `useUser()` returns Clerk’s user object (`id`, `firstName`, `username`, emails, …) plus `isSignedIn` / `isLoaded`. `UserButton` is Clerk’s avatar menu (profile, sign out).

Clerk keeps the session in the browser (cookies / tokens). `useUser()` is reading that session, not hitting your Postgres.

### Clerk → your server (webhook only)

On sign-up (and later profile updates), Clerk’s servers POST to `/webhooks/clerk`.

That route is registered **before** `express.json()` and uses `express.raw()`, because `verifyWebhook` needs the raw bytes plus Clerk’s signature (`CLERK_WEBHOOK_SIGNING_SECRET` / Svix headers). If verification fails → 400.

On success, `evt` looks like:

- `evt.type`: `"user.created"` or `"user.updated"`
- `evt.data`: Clerk user payload
  - `id` → stored as `clerk_user_id`
  - `email_addresses[0].email_address`
  - `first_name`, `last_name`

`user.created` → `INSERT … ON CONFLICT DO NOTHING`

`user.updated` → `UPDATE` email/name

Clerk does **not** store favourites. Favourites live only in Postgres.

### Your server → Clerk

Almost nothing. GraphQL never calls Clerk. Favouriting uses `user.id` from `useUser()` as `clerkUserId`. Anyone who can hit `/graphql` could send another person’s id. Fine for a learning app; not a real authz model.

---

## File by file

### Repo root — how the workspace is wired

**`package.json`**  
pnpm workspace named `car-tracker`. Scripts run both apps: `dev` starts server + client together; `build` builds both.

**`pnpm-workspace.yaml`**  
Workspaces are `src/apps/*`. Shared versions live in the `catalog` (React 19, Vite 8, TypeScript, etc.).

**`tsconfig.json`**  
Project references to client and server tsconfigs. No source of its own.

**`eslint.config.js`**  
Flat ESLint for `*.ts`/`*.tsx`: recommended JS/TS, React hooks, Vite refresh. Unused vars are warnings.

**`README.md`**  
Intent of the project (wiring, not UI). Architecture diagram is `public/artitechture_diagram.png`.

**`.gitignore` / `.gitattributes` / `.dockerignore`**  
Ignore `node_modules`, `dist`, `.env`, local Docker DB volume. Docker build context excludes env files and `node_modules`.

---

### Database and Docker

**`init-db/01-create-users.sql`**  
Postgres bootstrap (mounted into the Postgres container as `/docker-entrypoint-initdb.d`):

- `user_id` serial PK
- `clerk_user_id` unique, required
- `email_address` unique, required
- names
- `favorite_manufactures text[]` default `{}` (spelling is “manufactures” everywhere)

**`docker-compose.yml`** (prod-style local stack)  
Three services: Postgres 18, backend image, frontend image. Postgres must be healthy before the server starts. Server health is `GET /ready`. Frontend build args bake Clerk key and GraphQL URL into the Vite bundle (Vite env is compile-time).

**`docker-compose.dev.yml`**  
Dev variant: Postgres on host `5431`, one `Dockerfile.dev` app exposing Vite `5173` and API `3001`. It injects `DB_USER` / `DB_HOST` / etc., but the **server code uses `DATABASE_URL`**, so this compose file and `db.ts` are not aligned unless you also set `DATABASE_URL`.

**`Dockerfile.backend`**  
Multi-stage: pnpm install + `buildServer` → copy `dist` + pnpm symlink layout → `node dist/index.js` as user `node` on port 3001.

**`Dockerfile.frontend`**  
Build Vite with `VITE_*` args → `serve` static `dist` on 3000.

**`Dockerfile.dev`**  
Install + `pnpm run dev` with both ports exposed.

---

### Server (`src/apps/server`)

**`package.json`**  
Express, Apollo Server 4, `expressMiddleware`, `@clerk/express` (webhooks only), `pg` pool, cors, dotenv. Dev: `nodemon` + `tsx` on `src/index.ts`.

**`tsconfig.json`**  
NodeNext, emit to `dist/` from `src/`. That is why Docker runs `dist/index.js`.

**`src/helpers/const.ts`**

- Port: `PORT` (Render) or `SERVER_PORT`
- CORS origin: `CLIENT_ORIGIN` or Vite’s `http://localhost:5173`
- NHTSA base `https://vpic.nhtsa.dot.gov/api`
- `getAllManufacturers` is hardcoded to **page 2** of that API
- `getAllMakes` (CSV) is unused

**`src/config/db.ts`**  
Loads `.env` then `.env.local`. One `pg.Pool` from `DATABASE_URL`. Exports `{ query }` so resolvers never touch the pool directly.

**`src/schema.ts`**  
The GraphQL contract:

- **Types:** `AllManufacturers`, `GetMakeForManufacturer`, `GetModelsForMakeId`, `Users`
- **Queries:** `allManufacturers`, `getMakeForManufacturer(searchTerm)`, `getModelsForMakeId(makeId)`, `users(clerkUserId)`
- **Mutation:** `updateUserFavorites(clerkUserId, favoriteManufacturer) → Boolean`

This is the shape the client must match. NHTSA’s JSON is *not* this shape; resolvers translate.

**`src/resolvers.ts`**  
Each field’s implementation:

- `allManufacturers` — fetch NHTSA getallmanufacturers, map country/name/id/vehicle types. **No client query uses this today.**
- `getMakeForManufacturer` — search NHTSA by manufacturer name string.
- `getModelsForMakeId` — models for a numeric make id.
- `users` — if `clerkUserId` is passed, one row; else every user. Always normalises `favorite_manufactures` to an array.
- `updateUserFavorites` — **replaces** the whole `text[]` with whatever the client sent (`"makeId:Manufacturer Name"` strings). Returns `true`.
- Commented `combinedEndPointBFFPattern` — the original “one resolver, two sources, filter makes by favourites” sketch.

**`src/index.ts`** — the whole HTTP surface, in order:

1. Create Express app.
2. `POST /webhooks/clerk` (raw body + Clerk verify → insert/update users).
3. `express.json()` for everything after.
4. CORS for the client origin.
5. Construct Apollo with `typeDefs` + `resolvers`.
6. `GET /api/users` — dump all users (unused by UI).
7. `POST /api/addUser` — insert without `clerk_user_id` (would fail the SQL `NOT NULL` on that column). Leftover.
8. `GET /ready` — `SELECT 1` against Postgres; 200 or 503. Docker healthcheck.
9. `startServer()`: start Apollo, mount it at `/graphql`, `listen(port)`.

Express is the building. GraphQL is one room. The webhook is another room that GraphQL never enters.

---

### Client (`src/apps/client`)

**`package.json`**  
Vite React app: Apollo Client 4, MUI 9, Clerk (`@clerk/react-router` + `@clerk/react`), React Router 8, GraphQL codegen (configured, not clearly used in the components — they use inline `gql`).

**`index.html`**  
Mount `#root`, title Car Dossier, Icons8 credit in `<footer>` (outside React).

**`vite.config.ts`**  
React plugin + React Compiler (babel preset).

**`codegen.ts`**  
Would pull schema from the live GraphQL URL and generate `src/gql/`. Components still write documents by hand.

**`tsconfig*.json`**  
App TS (DOM, no emit, Vite client types) vs Node TS for `vite.config.ts`.

**`src/helpers/const.ts`**  
Apollo URI: `VITE_GRAPHQL_URL` or `http://localhost:${VITE_SERVER_PORT}/graphql`.

**`src/theme.ts`**  
MUI light theme, Roboto.

**`src/main.css`**  
Page chrome: 1126px column, full-bleed banner image `top-banner.jpg`, light/dark CSS variables.

**`src/main.tsx`** — client composition root:

- Apollo Client → your GraphQL URL, in-memory cache
- `BrowserRouter`
- `ClerkProvider`
- MUI `ThemeProvider` + `CssBaseline`
- Routes: `/` → `App`, `/makeDetails/:makeId` → `GetDetailsByMakeID`
- **No** `/sign-in` or `/sign-up` routes

**`src/App.tsx`**  
Banner + `AuthBar` overlay + `WelcomePage`.

**`src/components/AuthBar.tsx`**  
Clerk session UI only. No GraphQL.

**`src/components/WelcomePage.tsx`**  
Renders `SearchTabs`.

**`searchTabs/SearchTabs.tsx`**  
MUI tabs. Only “By Name” is live. “By Make & Year” is commented out.

**`searchTabs/SearchByName.tsx`**  
Search term in React state **and** `useSearchParams` so refresh keeps the query. Passes loading flag into the input.

**`searchTabs/SearchInput.tsx`**  
Controlled text field + submit. Disabled when empty; showing Apollo loading on the button.

**`searchTabs/DisplayAllMakes.tsx`** — where GraphQL and Clerk meet:

- `useUser()` from `@clerk/react` (elsewhere uses `@clerk/react-router`; same session).
- Query `getMake` asks NHTSA-backed makes **and**, if `isSignedIn`, `users` with `@include(if: $isSignedIn)` so unsigned visitors do not hit the users resolver.
- `skip: !searchTerm || !isLoaded` waits for Clerk so `clerkUserId` is real.
- Favourites hydrate from `"474:HONDA MOTOR CO., LTD."` strings.
- Checkbox toggles local state; a 500ms debounce mutation writes the full list. `hasUserChanged` avoids wiping the DB with `[]` on first load / StrictMode.
- Hearts disabled until signed in. Make id is a `Link` to the details page.

**`searchTabs/GetDetailsByMakeID.tsx`**  
Reads `:makeId` from the URL, passes an int to the table.

**`searchTabs/DisplayDetailsForMake.tsx`**  
Query `getModelsForMakeId`. Table columns are labelled Make / Manufacturer but the third column is actually **model name** from NHTSA.

**`searchTabs/SearchByMakeAndYear.tsx`**  
Unwired UI; submit only `console.log`s make + year.

**`searchTabs/DisplayAllCarsByVIN.tsx`**  
Stub: logs props, renders a div. Never imported.

**`app/routes/sign-in.tsx` / `sign-up.tsx`**  
Full-page Clerk `<SignIn />` / `<SignUp />`. Dead unless you add routes.

---

## What each system is *for*, in one line

- **React** paints the two pages and holds search/favourite UI state.
- **Apollo Client** is the GraphQL HTTP client + cache.
- **Clerk (browser)** is identity: who is this person (`user.id`).
- **Clerk (webhook)** copies that identity into Postgres so you can attach favourites.
- **Express** is the Node HTTP server.
- **Apollo Server** is the typed BFF on `/graphql`.
- **NHTSA** is the car catalogue.
- **Postgres** is “this Clerk user favourited these manufacturers.”
