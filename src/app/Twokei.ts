import "reflect-metadata";
import "./env";
import "../db/Kil";

import "@sapphire/plugin-i18next/register";

import { GatewayIntentBits, Partials } from "discord.js";
import {
  ApplicationCommandRegistries,
  LogLevel,
  RegisterBehavior,
} from "@sapphire/framework";

import { eq } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { coreGuilds } from "@/db/schemas/core-guilds";
import { DEFAULT_LOCALE, isValidLocale } from "@/locales/i18n";
import { TwokeiClient } from "@/structures/TwokeiClient";
import type { InternationalizationContext } from "@sapphire/plugin-i18next";
import pt_br from "@/locales/pt_br";
import { logger } from "@/lib/logger";
import { Xiao } from "@/music/controllers/Xiao";
import { startCronJobs } from "@/lib/cron/cron";

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

export const Twokei = new TwokeiClient({
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Debug,
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
    defaultLanguageDirectory: "./src/locales",
    i18next: {
      fallbackLng: "pt_br",
      supportedLngs: ["pt_br", "en_us"],
      resources: {
        pt_br,
      },
      interpolation: {
        defaultVariables: {
          name: "Twokei",
          mention: "@Twokei",
        },
      },
      joinArrays: "\n",
    },
    fetchLanguage: async (context: InternationalizationContext) => {
      if (!context.guild?.id) {
        return DEFAULT_LOCALE;
      }

      const [guild] = await kil
        .select({ locale: coreGuilds.locale })
        .from(coreGuilds)
        .where(eq(coreGuilds.guildId, context.guild.id));

      if (!guild || !isValidLocale(guild.locale)) {
        return DEFAULT_LOCALE;
      }

      return isValidLocale(guild.locale) ? guild.locale : DEFAULT_LOCALE;
    },
  },
});

export const init = async () => {
  logger.debug("Starting Twokei.");

  await Xiao.init(Twokei);
  await Twokei.login(process.env.DISCORD_TOKEN);

  await startCronJobs();
};
