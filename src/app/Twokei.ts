import { ExtendedClient } from "../structures/ExtendedClient";
import { ClusterClient as ShardClient } from 'discord-hybrid-sharding';
import { logger } from "../utils/Logger";

const { SHARD_LIST, TOTAL_SHARDS } = ShardClient.getInfo();


export const Twokei = new ExtendedClient({
  shards: SHARD_LIST,
  shardCount: TOTAL_SHARDS,
  intents: ['GuildMessages', 'Guilds', 'GuildVoiceStates']
});

Twokei.cluster.on('ready', () => logger.info('Shard ready!'));
Twokei.cluster.on('message', (message) => logger.debug(`Received a message`, message));

process.title = `Twokei Shard ${Twokei.cluster.id}`;


Twokei.shoukaku.on('ready', (name) => logger.info(`Lavalink node ${name} is now connected`));
Twokei.shoukaku.on('error', (name, error) => logger.error(`Lavalink node ${name} has had an error`, error));

Twokei.start().then(() => logger.info('Client ready!')).catch((error) => logger.error('Client failed to start', error));