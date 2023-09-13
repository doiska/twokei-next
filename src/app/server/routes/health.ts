import type { Next, ParameterizedContext } from "koa";
import { container } from "@sapphire/framework";

export async function GET(ctx: ParameterizedContext, next: Next) {
  if (!container.client?.shard) {
    ctx.status = 500;
    return;
  }

  const anyShardRunning = (container.client?.shard?.ids.length ?? 0) > 0;

  ctx.status = anyShardRunning ? 200 : 500;

  if (anyShardRunning) {
    ctx.body = {
      shards: container.client.shard?.count,
      ids: container.client.shard?.ids,
    };
  }

  return next();
}
