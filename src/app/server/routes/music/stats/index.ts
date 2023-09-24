import { Context, Next } from "koa";
import { container } from "@sapphire/framework";

type UnwrapArray<T> = T extends (infer U)[] ? U : T;

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
          (acc, curr) => acc + (curr.duration ?? 0),
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

  context.body = response.flat().reduce(
    (acc, curr) => {
      if (!acc[curr.shard]) {
        acc[curr.shard] = [];
      }

      acc[curr.shard].push(curr);
      return acc;
    },
    {} as Record<number, UnwrapArray<typeof response>>,
  );

  context.status = 200;
  return next();
}
