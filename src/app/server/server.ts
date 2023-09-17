import Koa from "koa";
import json from "koa-json";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";

import { env } from "@/app/env";
import { setupFileRouter } from "express-router-fs";
import { container } from "@sapphire/framework";

class Server {
  public koa: Koa;
  public router: Router;

  constructor() {
    this.koa = new Koa();
    this.router = new Router();

    container.server = this;
  }

  public async connect() {
    this.koa.use(json());
    this.koa.use(bodyParser());
    this.koa.use(this.router.routes()).use(this.router.allowedMethods());

    this.koa.use(async (ctx, next) => {
      if (ctx.headers["authorization"] !== env.RESOLVER_KEY) {
        ctx.status = 401;
        return;
      }

      return next();
    });

    await setupFileRouter(this.router as never, {
      directory: `${__dirname}/routes`,
    });

    this.koa.listen(Number(env.PORT));
  }
}

export { Server };
