import { PlayerDump } from "@twokei/shoukaku";
import { Events, VentiInitOptions } from "@/music/interfaces/player.types";
import { fetchLanguage } from "@sapphire/plugin-i18next";
import { container } from "@sapphire/framework";
import { Venti } from "@/music/controllers/Venti";
import { kil } from "@/db/Kil";
import { playerSessions } from "@/db/schemas/player-sessions";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/lib/logger";

const eventSchema = z.object({
  op: z.enum(["playerUpdate", "event"]),
  type: z.enum(["TrackStartEvent", "TrackEndEvent"]).optional(),
  guildId: z.string(),
});

export async function storeSession(node: string, event: unknown) {
  const result = eventSchema.safeParse(event);

  if (!result.success) {
    return;
  }

  const playerEvent = result.data;

  if (container.xiao.shoukaku.reconnectingPlayers.has(playerEvent.guildId)) {
    return;
  }

  const dump = container.xiao.shoukaku.playersDump.get(playerEvent.guildId);

  if (!dump) {
    await kil
      .delete(playerSessions)
      .where(eq(playerSessions.guildId, playerEvent.guildId));
    return;
  }

  await kil
    .insert(playerSessions)
    .values({
      guildId: playerEvent.guildId,
      state: dump,
      queue: container.xiao.players.get(playerEvent.guildId)?.queue.dump(),
    })
    .onConflictDoUpdate({
      target: playerSessions.guildId,
      set: {
        state: dump,
        queue: container.xiao.players.get(playerEvent.guildId)?.queue.dump(),
        updatedAt: sql`NOW()`,
      },
    });
}

export async function onShoukakuRestore(dumps: PlayerDump[]) {
  for (const dump of dumps) {
    if (!dump.state?.restored) {
      continue;
    }

    const restored = container.xiao.shoukaku.players.get(dump.options.guildId);

    if (!restored) {
      continue;
    }

    const guild = container.client.guilds.resolve(dump.options.guildId);
    const voiceId = restored?.connection.channelId;

    if (!guild || !voiceId) {
      continue;
    }

    const ventiOptions: VentiInitOptions = {
      lang: (await fetchLanguage(guild)) as "pt_br",
      voiceChannel: voiceId,
      deaf: dump.options.deaf,
      guild: guild,
      shardId: dump.options.shardId,
    };

    const { message, channel } = (await container.sc.getEmbed(guild)) ?? {};

    if (message && channel) {
      ventiOptions.embedMessage = message;
    } else {
      logger.warn(
        `No message or channel found for guild ${guild.name} while restoring...`,
        {
          guildId: guild.id,
          message: message?.id,
          channel: channel?.id,
        },
      );
    }

    const [restorableQueue] = await kil
      .select({
        queue: playerSessions.queue,
      })
      .from(playerSessions)
      .where(eq(playerSessions.guildId, guild.id));

    const venti = new Venti(container.xiao, restored, ventiOptions);

    venti.queue.restore(restorableQueue.queue);

    container.xiao.players.set(dump.options.guildId, venti);
    container.xiao.emit(Events.ManualUpdate, venti, {
      embed: true,
      components: true,
    });
  }

  await kil.delete(playerSessions);
}
