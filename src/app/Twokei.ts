import { ExtendedClient } from "./ExtendedClient";
import { ClusterClient as ShardClient } from 'discord-hybrid-sharding';

const { SHARD_LIST, TOTAL_SHARDS } = ShardClient.getInfo();

const client = new ExtendedClient({
  shards: SHARD_LIST,
  shardCount: TOTAL_SHARDS,
  intents: ['GuildMessages', 'Guilds']
});

client.cluster.on('ready', () => console.log('Shard ready!'));
client.cluster.on('message', (message) => console.log(`Received a message`, message));

client.shoukaku.on('ready', (name) => console.log(`Lavalink node ${name} is now connected`));
client.shoukaku.on('error', (name, error) => console.log(`Lavalink node ${name} has had an error`, error));

client.login(process.env.TOKEN).then(() => console.log('Logged in!'));