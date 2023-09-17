import "@sapphire/plugin-editable-commands/register";
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-subcommands/register";

import {
  ApplicationCommandRegistries,
  RegisterBehavior,
} from "@sapphire/framework";
import { createEnv } from "@t3-oss/env-core";
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
    RESOLVER_URL: z.string(),
    RESOLVER_KEY: z.string(),
    WEBSITE_URL: z.string().url(),
    SPOTIFY_CLIENT_SECRET: z.string(),
    SPOTIFY_CLIENT_ID: z.string(),
    PORT: z.number().default(3005),
    SHARDING_MANAGER_ENABLED: z
      .string()
      .default("true")
      .transform((value) => value === "true"),
  },
  runtimeEnv: process.env,
});
