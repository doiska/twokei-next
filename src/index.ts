import { ClusterManager, ReClusterManager, HeartbeatManager } from 'discord-hybrid-sharding';
import { config } from 'dotenv';
import { green, red } from "kleur";
import { logger } from "./modules/logger-transport";

config();

const shardingManager = new ClusterManager(`${__dirname}/app/Twokei.js`, {
  token: process.env.TOKEN,
  mode: 'process',
  shardsPerClusters: 1,
  totalShards: 1
});

shardingManager.extend(
  new HeartbeatManager({ interval: 10000, maxMissedHeartbeats: 3 }),
  new ReClusterManager({ restartMode: "gracefulSwitch" })
);

shardingManager.on('clusterCreate', (cluster) => logger.info(`[Cluster] ID: ${green(cluster.id)} has been created.`));

shardingManager
  .spawn({ timeout: -1, delay: 7000 })
  .then(() => logger.info(`[Cluster] All clusters have been spawned.`))
  .catch(e => logger.error(`[Cluster] Failed to spawn clusters: ${red(e)}`));