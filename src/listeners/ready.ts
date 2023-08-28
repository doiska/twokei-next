import type { Client } from "discord.js";
import { Events } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";

import { logger } from "@/modules/logger-transport";

@ApplyOptions<Listener.Options>({
  name: "ready-event",
  event: Events.ClientReady,
})
export class ReadyListener extends Listener {
  public run(client: Client) {
    const { username, id } = client.user ?? {};

    if (!username || !id) {
      throw new Error("Invalid client user");
    }

    logger.info(`Successfully logged in as ${username} (${id})`);
  }
}
