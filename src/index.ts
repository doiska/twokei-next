import { ClusterManager } from 'discord-hybrid-sharding';
import dotenv from 'dotenv';

dotenv.config();

const shardingManager = new ClusterManager(`${__dirname}/app/Twokei.js`, {
  token: process.env.TOKEN,
  shardsPerClusters: 1,
  mode: 'worker',
});

shardingManager.on('clusterCreate', (cluster) => console.log(`Cluster ${cluster.id} has been created.`));

shardingManager
  .spawn()
  .then(r => console.log(`Successfully spawned clusters.`))
  .catch(e => console.log(`Failed to spawn clusters.`, e));