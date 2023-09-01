import "@sapphire/plugin-api/register";
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
    SPOTIFY_CLIENT_ID: z.string(),
    SPOTIFY_CLIENT_SECRET: z.string(),
    PG_SCHEMA: z.string(),
    RESOLVER_URL: z.string(),
    RESOLVER_KEY: z.string(),
    DATABASE_URL: z.string().url(),
    DISCORD_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
});
