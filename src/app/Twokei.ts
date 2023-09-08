import "reflect-metadata";
import "./env";
import "../db/Kil";

import "@sapphire/plugin-i18next/register";

import { ActivityType, GatewayIntentBits, Partials } from "discord.js";
import {
  ApplicationCommandRegistries,
  container,
  LogLevel,
  RegisterBehavior,
} from "@sapphire/framework";

import { eq } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { guilds } from "@/db/schemas/guild";
import { DEFAULT_LOCALE, isValidLocale } from "@/locales/i18n";
import { TwokeiClient } from "@/structures/TwokeiClient";
import type { InternationalizationContext } from "@sapphire/plugin-i18next";
import pt_br from "@/locales/pt_br";
import { noop } from "@sapphire/utilities";

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

export const Twokei = new TwokeiClient({
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Error,
  },
  shards: "auto",
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
  ],
  partials: [Partials.Channel],
  loadMessageCommandListeners: true,
  enableLoaderTraceLoggings: false,
  i18n: {
    defaultLanguageDirectory: "./dist/locales",
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
        .select({ locale: guilds.locale })
        .from(guilds)
        .where(eq(guilds.guildId, context.guild.id));

      if (!guild || !isValidLocale(guild.locale)) {
        return DEFAULT_LOCALE;
      }

      return isValidLocale(guild.locale) ? guild.locale : DEFAULT_LOCALE;
    },
  },
});

const main = async () => {
  await Twokei.login(process.env.DISCORD_TOKEN);

  Twokei?.user?.setPresence({
    activities: [
      {
        name: "Music Bot: Twokei.com",
        type: ActivityType.Custom,
        url: "https://twokei.com",
      },
    ],
  });

  for (const guild of [...Twokei.guilds.cache.values()]) {
    container.sc.reset(guild).catch(noop);
  }
};

void main();
