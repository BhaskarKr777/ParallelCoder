import { config } from "dotenv";

/*
  dotenv.config() never overrides an already-set process.env var,
  so this only fills in test defaults when the environment (e.g. CI)
  hasn't already provided them directly. Runs before env.js's own
  `import "dotenv/config"` picks up .env, so these values win.
*/
config({ path: ".env.test" });
