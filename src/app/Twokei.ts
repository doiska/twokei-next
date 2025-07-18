import "reflect-metadata";
import "./env";
import "../db/Kil";
import "@/i18n/register";

import { GatewayIntentBits, Partials } from "discord.js";
import {
  ApplicationCommandRegistries,
  container,
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
import { env } from "@/app/env";
import { playerSongChannels } from "@/db/schemas/player-song-channels";

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.VerboseOverwrite,
);

if (env.DISCORD_GUILD_ID) {
  ApplicationCommandRegistries.setDefaultGuildIds([env.DISCORD_GUILD_ID]);
}

export const Twokei = new TwokeiClient({
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Error,
  },
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
  ],
  baseUserDirectory: null,
  partials: [Partials.Channel],
  loadMessageCommandListeners: true,
  enableLoaderTraceLoggings: false,
  i18n: {
    defaultLanguage: "pt_br",
    i18nOptions: {
      fallbackLng: "pt_br",
      supportedLngs: ["pt_br"],
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

  await Twokei.login(env.DISCORD_TOKEN)
    .then(() => logger.debug(`Logged in as ${Twokei.user?.tag}`))
    .catch((error) => {
      logger.error("Error while logging in", error);
    });

  await startCronJobs();

  if (env.RESET_SONG_CHANNEL === "true") {
    setTimeout(async () => {
      const guilds = await kil.select().from(playerSongChannels);

      for await (const { guildId } of guilds) {
        try {
          logger.debug(`Reseting guild ${guildId}...`);

          const guild = Twokei.guilds.cache.get(guildId);

          if (!guild) {
            continue;
          }

          await container.sc.reset(guild);
          logger.debug(`Reseted guild ${guildId}!`);
        } catch (error) {
          logger.error(
            `Error while reseting song channels for guild ${guildId}`,
            error,
          );
        }
      }
    }, 5000);
  }
};
