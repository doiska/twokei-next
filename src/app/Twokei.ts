import 'reflect-metadata';
import { logger } from '../modules/logger-transport';
import { ExtendedClient } from '../structures/ExtendedClient';

export const Twokei = new ExtendedClient({
  intents: [
    'Guilds',
    'GuildVoiceStates',
    'GuildMessages'
  ]
});

Twokei.start()
  .then(() => logger.info('Client ready!'))
  .catch((error) => logger.error('Client failed to start', error));