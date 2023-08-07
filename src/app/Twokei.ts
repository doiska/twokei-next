import 'reflect-metadata';
import '../utils/setup';
import 'twokei-i18next/register';

import { GatewayIntentBits, Partials } from 'discord.js';
import {
  ApplicationCommandRegistries,
  LogLevel,
  RegisterBehavior,
} from '@sapphire/framework';

import { eq } from 'drizzle-orm';
import { kil } from '@/db/Kil';
import { guilds } from '@/db/schemas/guild';

import en_us from '@/locales/en_us';
import { DEFAULT_LOCALE, isValidLocale } from '@/locales/i18n';
import pt_br from '@/locales/pt_br';
import { TwokeiClient } from '@/structures/TwokeiClient';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

export const Twokei = new TwokeiClient({
  api: {
    listenOptions: {
      port: 3000,
    },
  },
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Error,
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
      joinArrays: '\n',
    },
    defaultLanguageDirectory: './src/locales',
    fetchLanguage: async (context) => {
      if (context.user) {
        return 'pt_br';
      }

      if (!context.guild?.id) {
        return 'pt_br';
      }

      const [guild] = await kil
        .select({ locale: guilds.locale })
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
  await Twokei.login(process.env.DISCORD_TOKEN);
};

void main();
