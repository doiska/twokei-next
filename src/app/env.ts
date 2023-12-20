import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-subcommands/register";

import { createEnv } from "@t3-oss/env-core";
import {
  ApplicationCommandRegistries,
  RegisterBehavior,
} from "@sapphire/framework";
import { z } from "zod";

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

export const env = createEnv({
  server: {
    CLIENT_ID: z.string().optional(),
    NODE_ENV: z.enum(["production", "staging", "development"]),
    DISCORD_TOKEN: z.string(),
    DATABASE_URL: z.string().url(),
    PG_SCHEMA: z.string(),
    RESOLVER_KEY: z.string(),
    SPOTIFY_CLIENT_SECRET: z.string(),
    SPOTIFY_CLIENT_ID: z.string(),
    PORT: z.union([z.number(), z.string()]).default(3005),
    SHARDING_MANAGER_ENABLED: z
      .string()
      .default("false")
      .transform((value) => value === "true"),
  },
  runtimeEnv: process.env,
});

export const IS_DEV = env.NODE_ENV === "development";
