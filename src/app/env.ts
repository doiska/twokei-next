import "dotenv/config";

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DISCORD_TOKEN: z.string(),
    LOG_LEVEL: z
      .enum(["error", "warn", "info", "verbose", "debug", "silly"])
      .default("debug"),
    NODE_ENV: z.enum(["production", "development"]),
    DATABASE_URL: z.string().url(),
    PG_SCHEMA: z.string(),
    SPOTIFY_CLIENT_SECRET: z.string(),
    SPOTIFY_CLIENT_ID: z.string(),
    EXTERNAL_PROFILE_ENDPOINT: z.string().url().optional(),
    LAVA_SEARCH_ENGINE: z.string(),
  },
  runtimeEnv: process.env,
});
