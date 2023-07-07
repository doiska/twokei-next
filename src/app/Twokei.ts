import 'reflect-metadata';
import '../modules/setup';
import 'twokei-i18next/register';

import { eq } from 'drizzle-orm';

import { GatewayIntentBits, Partials } from 'discord.js';
import {
  ApplicationCommandRegistries,
  LogLevel,
  RegisterBehavior,
} from '@sapphire/framework';

import { TwokeiClient } from '@/structures/TwokeiClient';
import pt_br from '@/locales/pt_br';
import { DEFAULT_LOCALE, isValidLocale } from '@/locales/i18n';
import en_us from '@/locales/en_us';
import { guilds } from '@/db/schemas/Guild';
import { kil } from '@/db/Kil';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

export const Twokei = new TwokeiClient({
  api: {
    listenOptions: {
      port: 5000,
    },
  },
  defaultPrefix: '*',
  regexPrefix: /^(hey +)?bot[,! ]/i,
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Debug,
  },
  shards: 'auto',
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
  ],
  partials: [Partials.Channel],
  loadMessageCommandListeners: true,
  enableLoaderTraceLoggings: false,
  i18n: {
    i18next: {
      fallbackLng: 'pt_br',
      supportedLngs: ['pt_br', 'en_us'],
      resources: {
        pt_br,
        en_us,
      },
      interpolation: {
        defaultVariables: {
          name: 'Twokei',
          mention: '@Twokei',
        },
      },
    },
    defaultLanguageDirectory: './src/locales',
    fetchLanguage: async (context) => {
      if (!context.guild?.id) {
        return 'pt_br';
      }

      const [guild] = await kil
        .select()
        .from(guilds)
        .where(eq(guilds.guildId, context.guild.id));

      if (!guild || !isValidLocale(guild.locale)) {
        return DEFAULT_LOCALE;
      }

      return guild.locale;
    },
  },
});

const main = async () => {
  try {
    await Twokei.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    Twokei.logger.fatal(error);
    process.exit(1);
  }
};

main();
