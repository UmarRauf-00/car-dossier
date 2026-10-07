import { config } from "dotenv";

// Loaded first from index.ts so every module sees these values.
// .env.local (gitignored, machine-specific) overrides .env when present
config();
config({ path: ".env.local", override: true });
