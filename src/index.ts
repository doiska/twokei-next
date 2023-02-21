import { ClusterManager, ReClusterManager, HeartbeatManager } from 'discord-hybrid-sharding';
import { config } from 'dotenv';
import { bold, green, red } from 'kleur';
import { logger } from "./modules/logger-transport";
import { ChildProcess } from 'child_process';
import { Worker as Worker_Thread } from 'worker_threads';
import * as Sentry from '@sentry/node';

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

const isChildProcess = (process: any): process is ChildProcess => process.send !== undefined;

const getPid = (thread?: Worker_Thread | ChildProcess | null) => {
  if(!thread) return 'undefined';
  return (isChildProcess(thread) ? thread.pid : thread.threadId) || 'undefined';
}

shardingManager.on('clusterCreate', (cluster) => {
  logger.info(`[Cluster] Cluster Id: ${bold(cluster.id)} has been created and is now starting...`);

  cluster.on('spawn', (thread) => {
    if(!thread) {
      logger.error(`[Cluster] Cluster ${red(cluster.id)} has spawned, but the thread is undefined.`);
      return;
    }

    logger.info(`[Cluster] Cluster Id: ${bold(cluster.id)} has spawned. PID: ${bold(getPid(thread))}`);
  });

  cluster.on('message', (message) => logger.debug(`[Cluster] Cluster ${cluster.id} has received a message: ${message}`));

  cluster.on('error', (error) => {
    logger.error(`[Cluster] Cluster ${red(cluster.id)} has had an error: ${red(error.message)}`, error)
  });

  cluster.on('death', (cluster, thread) => {
    logger.error(`[Cluster] Cluster ${red(cluster.id)} has died. PID: ${red(getPid(thread))}`);
  });
});

shardingManager
  .spawn()
  .then(() => logger.info(bold(`[Cluster] All clusters have been spawned.`)))
  .catch(e => logger.error(bold(`[Cluster] Failed to spawn clusters: ${red(e)}`)));

const stdin = process.openStdin();

stdin.addListener('data', (d) => {
  const input = d.toString().trim();
  if(input === 'exit') {
    logger.info('Exiting...');
    shardingManager.broadcastEval('process.exit()');
  }
});