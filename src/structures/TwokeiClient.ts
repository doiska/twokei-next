import { type ClientOptions } from "discord.js";
import { SapphireClient } from "@sapphire/framework";

import { logger } from "@/lib/logger";

export class TwokeiClient extends SapphireClient {
  public constructor(options: ClientOptions) {
    super(options);

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught exception:", error);
    });
  }
}
