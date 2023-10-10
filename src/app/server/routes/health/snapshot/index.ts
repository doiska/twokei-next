import v8 from "v8";
import { Next, ParameterizedContext } from "koa";

export function GET(ctx: ParameterizedContext, next: Next) {
  const snapshot = v8.getHeapSnapshot();

  ctx.attachment("snapshot.heapsnapshot");
  ctx.set("Content-Type", "application/octet-stream");
  ctx.body = snapshot;

  ctx.status = 200;

  return next();
}
