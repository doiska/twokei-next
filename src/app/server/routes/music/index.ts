import { Next, ParameterizedContext } from "koa";
import { container } from "@sapphire/framework";

export async function GET(ctx: ParameterizedContext, next: Next) {
  try {
    await container.client?.shard?.broadcastEval((client) => {
      console.log(client.xiao.players.size);
    });
    // await container.xiao.loadNodes();
    // ctx.status = 200;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
  }

  return next();
}
