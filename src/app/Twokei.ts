import 'reflect-metadata';
import { ExtendedClient } from '../structures/ExtendedClient';
import { logger } from '../modules/logger-transport';

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