import {
  Plugin,
  postInitialization,
  preLogin,
  SapphireClient,
} from "@sapphire/framework";
import { Server } from "@/app/server/server";
import { logger } from "@/modules/logger-transport";

export class HttpServerHook extends Plugin {
  public static [postInitialization](this: SapphireClient) {
    this.server = new Server();
  }

  public static [preLogin](this: SapphireClient) {
    if (this.shard) {
      logger.info("Using shards, skipping server connection.");
      return;
    }

    this.server?.connect();
  }
}

SapphireClient.plugins.registerPostInitializationHook(
  HttpServerHook[postInitialization],
  "API-PostInitialization",
);
SapphireClient.plugins.registerPreLoginHook(
  HttpServerHook[preLogin],
  "API-PreLogin",
);
