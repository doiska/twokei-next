import {
  Plugin,
  postInitialization,
  SapphireClient,
} from "@sapphire/framework";
import { Server } from "@/app/server/server";

export class HttpServerHook extends Plugin {
  public static [postInitialization](this: SapphireClient) {
    this.server = new Server();
  }
}

SapphireClient.plugins.registerPostInitializationHook(
  HttpServerHook[postInitialization],
  "API-PostInitialization",
);
