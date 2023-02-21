import 'reflect-metadata';

import { ExtendedClient } from '../structures/ExtendedClient';
import { ClusterClient as ShardClient } from 'discord-hybrid-sharding';
import { logger } from '../modules/logger-transport';

const { SHARD_LIST, TOTAL_SHARDS } = ShardClient.getInfo();

export const Twokei = new ExtendedClient({
  shards: SHARD_LIST,
  shardCount: TOTAL_SHARDS,
  intents: [
    'Guilds',
    'GuildVoiceStates',
    'GuildMessages'
  ]
});

Twokei.cluster.on('message', (message) => logger.debug(`Received a message`, message));

Twokei.start().then(() => logger.info('Client ready!')).catch((error) => logger.error('Client failed to start', error));