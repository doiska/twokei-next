import { ExtendedClient } from "./ExtendedClient";
import { ClusterClient as ShardClient } from 'discord-hybrid-sharding';

const { SHARD_LIST, TOTAL_SHARDS } = ShardClient.getInfo();

export const Twokei = new ExtendedClient({
  shards: SHARD_LIST,
  shardCount: TOTAL_SHARDS,
  intents: ['GuildMessages', 'Guilds']
});

Twokei.cluster.on('ready', () => console.log('Shard ready!'));
Twokei.cluster.on('message', (message) => console.log(`Received a message`, message));

Twokei.shoukaku.on('ready', (name) => console.log(`Lavalink node ${name} is now connected`));
Twokei.shoukaku.on('error', (name, error) => console.log(`Lavalink node ${name} has had an error`, error));

Twokei.start().then(() => console.log('Started!'));