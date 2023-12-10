import { PlayerDump } from "@twokei/shoukaku";
import { container } from "@sapphire/framework";
import { Events, VentiInitOptions } from "@/music/interfaces/player.types";
import { fetchLanguage } from "@sapphire/plugin-i18next";
import { kil } from "@/db/Kil";
import { playerSessions } from "@/db/schemas/player-sessions";
import { eq } from "drizzle-orm";
import { Venti } from "@/music/controllers/Venti";

export async function playerSessionRestored(dumps: PlayerDump[]) {
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
