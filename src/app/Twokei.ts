import "reflect-metadata";
import "./env";
import "../db/Kil";
import "@/i18n/register";

import { GatewayIntentBits, Partials } from "discord.js";
import {
  ApplicationCommandRegistries,
  LogLevel,
  RegisterBehavior,
} from "@sapphire/framework";

import { eq } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { coreGuilds } from "@/db/schemas/core-guilds";
import { TwokeiClient } from "@/structures/TwokeiClient";
import { logger } from "@/lib/logger";
import { Xiao } from "@/music/controllers/Xiao";
import { startCronJobs } from "@/lib/cron/cron";
import { namespaces } from "@/i18n/locales/pt_br";

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

export const Twokei = new TwokeiClient({
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Error,
  },
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
  ],
  baseUserDirectory: null,
  partials: [Partials.Channel],
  loadMessageCommandListeners: true,
  enableLoaderTraceLoggings: false,
  i18n: {
    defaultLanguage: "pt_br",
    i18nOptions: {
      fallbackLng: "pt_br",
      supportedLngs: ["pt_br", "en_us"],
      resources: {
        pt_br: namespaces,
      },
      interpolation: {
        defaultVariables: {
          name: "Twokei",
          mention: "@Twokei",
        },
      },
      joinArrays: "\n",
    },
    fetchLanguage: async (context) => {
      if (!context.guild) {
        return;
      }

      const [guild] = await kil
        .select({ locale: coreGuilds.locale })
        .from(coreGuilds)
        .where(eq(coreGuilds.guildId, context.guild.id));

      return guild?.locale ?? "pt_br";
    },
  },
});

export const init = async () => {
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection at:", reason);
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception thrown", error);
  });

  logger.debug("Starting Twokei.");

  await Xiao.init(Twokei);

  await import("../listeners/_load");
  await import("../interaction-handlers/_load");
  await import("../commands/_load");

  await Twokei.login(process.env.DISCORD_TOKEN);
  await startCronJobs();
};
