import "@sapphire/plugin-i18next/register";
import "@/app/server/hooks/HttpServerHook";

import { type ClientOptions } from "discord.js";
import { container, SapphireClient } from "@sapphire/framework";

import { Analytics } from "@/structures/Analytics";
import { SongChannelManager } from "@/structures/SongChannels";
import { Xiao } from "@/music/controllers/Xiao";
import { Connectors } from "shoukaku";
import { env } from "@/app/env";
import { logger } from "@/lib/logger";
import { kil } from "@/db/Kil";
import { playerSessions } from "@/db/schemas/player-sessions";

export class TwokeiClient extends SapphireClient {
  public xiao!: Xiao;

  public constructor(options: ClientOptions) {
    super(options);

    container.sc = new SongChannelManager();
    container.analytics = new Analytics();

    process.on("unhandledRejection", (error) => {
      logger.error("Unhandled rejection:", error);
    });

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught exception:", error);
    });

    this.start();
  }

  private async start() {
    const sessions = await kil.select().from(playerSessions);

    const dumpState = sessions.map((session) => [
      session.guildId,
      session.state,
    ]);

    this.xiao = new Xiao(
      this,
      {
        send: (guildId, payload) => {
          const guild = this.guilds.cache.get(guildId);
          if (guild) {
            guild.shard.send(payload);
          }
        },
      },
      new Connectors.DiscordJS(this),
      [],
      {
        resume: true,
        reconnectInterval: 5000,
        reconnectTries: 10,
        userAgent: `Twokei (${env.NODE_ENV})`,
      },
      dumpState,
    );
    container.xiao = this.xiao;
  }
}
