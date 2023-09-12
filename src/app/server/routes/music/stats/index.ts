import { Context, Next } from "koa";
import { container } from "@sapphire/framework";

export async function GET(context: Context, next: Next) {
  if (!container.client?.shard) {
    context.status = 500;
    return;
  }

  const response = await container.client?.shard?.broadcastEval((client) =>
    [...client.xiao.players.values()].map((player) => {
      return {
        shard: player.guild.shardId,
        guild: {
          id: player.guildId,
          name: player.guild?.name ?? "Unknown name",
        },
        queueSize: player.queue.totalSize,
        queueLength: player.queue.reduce(
          (acc, curr) => acc + (curr.length ?? 0),
          0,
        ),
        voiceChannel: player.voiceId,
      };
    }),
  );

  if (!response) {
    context.status = 500;
    return;
  }

  const flatten = response.flat();

  const grouped = flatten.reduce(
    (acc, curr) => {
      if (!acc[curr.shard]) {
        acc[curr.shard] = [];
      }

      acc[curr.shard].push(curr);

      return acc;
    },
    {} as Record<number, typeof flatten>,
  );

  context.status = 200;
  context.body = grouped;

  return next();
}
