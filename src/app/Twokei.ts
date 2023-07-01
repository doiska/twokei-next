import 'reflect-metadata';
import '../modules/setup';
import '@sapphire/plugin-i18next/register';

import {
  ApplicationCommandRegistries,
  LogLevel,
  RegisterBehavior,
  SapphireClient,
} from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';

import en_us from '@/locales/en_us';
import pt_br from '@/locales/pt_br';
import { getGuidLocale } from '@/modules/guild-locale';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

export const Twokei = new SapphireClient({
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
    defaultLanguageDirectory: './dist/locales',
    fetchLanguage: async (context) => {
      if (!context.guild?.id) {
        return 'pt_br';
      }

      return getGuidLocale(context.guild?.id);
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
