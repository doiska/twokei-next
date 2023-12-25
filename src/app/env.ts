import "dotenv/config";

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    LOG_LEVEL: z
      .enum(["error", "warn", "info", "verbose", "debug", "silly"])
      .default("debug"),
    NODE_ENV: z.enum(["production", "development"]),
    DISCORD_TOKEN: z.string(),
    DATABASE_URL: z.string().url(),
    PG_SCHEMA: z.string(),
    RESOLVER_KEY: z.string(),
    SPOTIFY_CLIENT_SECRET: z.string(),
    SPOTIFY_CLIENT_ID: z.string(),
  },
  runtimeEnv: process.env,
});
