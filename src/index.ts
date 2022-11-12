import { ClusterManager } from 'discord-hybrid-sharding';
import { config } from 'dotenv';

config();

const shardingManager = new ClusterManager(`${__dirname}/app/Twokei.js`, {
  token: process.env.TOKEN,
  mode: 'process',
  shardsPerClusters: 1,
  totalShards: 1,
});

shardingManager.on('clusterCreate', (cluster) => console.log(`Cluster ${cluster.id} has been created.`));

shardingManager
  .spawn()
  .then(() => console.log(`Successfully spawned clusters.`))
  .catch(e => console.log(`Failed to spawn clusters.`, e));