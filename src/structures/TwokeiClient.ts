import "@sapphire/plugin-i18next/register";
import "@/app/server/hooks/HttpServerHook";

import { type ClientOptions } from "discord.js";
import { container, SapphireClient } from "@sapphire/framework";

import { Analytics } from "@/structures/Analytics";
import { SongChannelManager } from "@/structures/SongChannels";
import { Xiao } from "@/music/controllers/Xiao";
import { Connectors } from "@twokei/shoukaku";
import { env } from "@/app/env";
import { logger } from "@/lib/logger";
import { kil } from "@/db/Kil";
import { PlayerSession, playerSessions } from "@/db/schemas/player-sessions";

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
    const allSessions = await kil.select().from(playerSessions);

    const sessions = allSessions.reduce<{
      expired: PlayerSession[];
      valid: PlayerSession[];
    }>(
      (acc, session) => {
        const isQueueValid =
          session.queue.current || session.queue.queue.length > 0;

        const isSessionExpired =
          !session.updatedAt ||
          session.updatedAt.getTime() + 30000 < Date.now();

        if (isSessionExpired || !isQueueValid) {
          acc.expired.push(session);
        } else {
          acc.valid.push(session);
        }

        return acc;
      },
      {
        expired: [],
        valid: [],
      },
    );

    logger.info(`Resuming ${sessions.valid.length} of ${allSessions.length}.`);

    const dumpState = sessions.valid.map((session) => {
      const now = Date.now();
      const lastUpdate = session.state.timestamp;

      const duration = session.state.player.position;

      const correction = now - lastUpdate + 5000;

      logger.debug(
        `Session ${session.guildId} was last updated ${correction}ms ago. Correcting by ${correction}ms.`,
      );

      session.state.player.position = (duration ?? 0) + correction;
      return [session.guildId, session.state];
    });

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
        moveOnDisconnect: true,
        reconnectInterval: 3000,
        reconnectTries: 5,
        userAgent: `Twokei (${env.NODE_ENV})`,
      },
      dumpState,
    );

    container.xiao = this.xiao;

    for (const session of sessions.expired) {
      logger.debug(`Cleaning up session ${session.guildId}.`);
      const guild = await container.client.guilds.fetch(session.guildId);

      if (!guild) {
        continue;
      }

      logger.debug(`Cleaned session ${session.guildId}.`);
      await container.sc.reset(guild);
    }
  }
}
