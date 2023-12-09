import type { Next, ParameterizedContext } from "koa";
import { container } from "@sapphire/framework";

export async function GET(ctx: ParameterizedContext, next: Next) {
  if (!container.client) {
    ctx.status = 500;
    return;
  }

  const nodesRunning = container.xiao.shoukaku.nodes.size > 0;

  if (!nodesRunning) {
    ctx.status = 500;
    ctx.body = {
      message: "No nodes running",
    };
    return;
  }

  if (container.client.shard) {
    const anyShardRunning = (container.client?.shard?.ids.length ?? 0) > 0;

    ctx.status = anyShardRunning ? 200 : 500;

    if (anyShardRunning) {
      ctx.body = {
        shards: container.client.shard?.count,
        ids: container.client.shard?.ids,
      };
    }
  } else if (container.client.user) {
    ctx.status = 200;
  } else {
    ctx.status = 500;
  }

  return next();
}
