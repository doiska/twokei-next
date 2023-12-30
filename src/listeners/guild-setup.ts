import { Locale, Events, type Guild } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";

import { sql } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { coreGuilds } from "@/db/schemas/core-guilds";

import { setupNewChannel } from "@/music/song-channel/setup-new-channel";
import { setupSongMessage } from "@/music/song-channel/setup-song-message";
import { logger } from "@/lib/logger";

@ApplyOptions<Listener.Options>({
  name: "guild-setup-event",
  event: Events.GuildCreate,
})
export class GuildSetup extends Listener<Events.GuildCreate> {
  public async run(guild: Guild) {
    logger.info(`Joined guild ${guild.name} (${guild.id})`);

    try {
      const guildLocale =
        guild.preferredLocale === Locale.PortugueseBR ? "pt_br" : "en_us";

      await kil
        .insert(coreGuilds)
        .values({
          guildId: guild.id,
          name: guild.name,
          locale: guildLocale,
        })
        .onConflictDoUpdate({
          target: coreGuilds.guildId,
          set: {
            name: guild.name,
            updated_at: sql`NOW()`,
          },
        });

      const newChannel = await setupNewChannel(guild);
      await setupSongMessage(guild, newChannel);
    } catch (e) {
      const owner = await guild.fetchOwner().catch(() => null);

      if (!owner) {
        return;
      }

      await owner.send(
        "Oi! Eu fui convidado para o servidor mas não consegui criar meu canal de música, pode por favor conferir as permissões dadas (ou adicionar como administrador)? Depois basta usar /setup novamente, obrigado!",
      );
    }
  }
}

void container.stores.loadPiece({
  name: "guild-setup-event",
  piece: GuildSetup,
  store: "listeners",
});
