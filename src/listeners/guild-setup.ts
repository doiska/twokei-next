import { Events, type Guild } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";

import { sql } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { guilds } from "@/db/schemas/guild";

import { setupGuildLanguage } from "@/features/song-channel/setup-guild-language";
import { setupNewChannel } from "@/features/song-channel/setup-new-channel";
import { setupSongMessage } from "@/features/song-channel/setup-song-message";
import { logger } from "@/modules/logger-transport";

@ApplyOptions<Listener.Options>({
  name: "guild-setup-event",
  event: Events.GuildCreate,
})
export class GuildSetup extends Listener<Events.GuildCreate> {
  public async run(guild: Guild) {
    logger.info(`Joined guild ${guild.name} (${guild.id})`);

    await kil
      .insert(guilds)
      .values({
        guildId: guild.id,
        name: guild.name,
        locale: guild.preferredLocale === "pt-BR" ? "pt_br" : "en_us",
      })
      .onConflictDoUpdate({
        target: guilds.guildId,
        set: {
          name: guild.name,
          updated_at: sql`NOW()`,
        },
      });

    const response = await setupNewChannel(guild).catch(async (e) => {
      logger.error(`Error at guild-setup ${guild.name} (${guild.id})`, {
        stack: e.stack,
        error: e,
      });
    });

    if (!response) {
      const owner = await guild.fetchOwner();

      if (!owner) {
        return;
      }

      await owner.send(
        "Oi! Eu fui convidado para o servidor mas não consegui criar meu canal de música, pode por favor conferir as permissões dadas (ou adicionar como administrador)? Depois basta usar /setup novamente, obrigado!",
      );
      return;
    }

    await setupGuildLanguage(response).catch(() =>
      logger.info("Error while setupGuildLanguage"),
    );
    await setupSongMessage(guild, response).catch(() =>
      logger.info("Error while setupSongMessage"),
    );
  }
}
