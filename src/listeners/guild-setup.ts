import { Events, type Guild } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";

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

    await kil
      .insert(coreGuilds)
      .values({
        guildId: guild.id,
        name: guild.name,
        locale: "pt_br",
      })
      .onConflictDoUpdate({
        target: coreGuilds.guildId,
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
    // TODO: en-US translation
    // await setupGuildLanguage(response).catch((e) => {
    //       logger.info("Error while setupGuildLanguage");
    //       logger.error(e);
    // });

    await setupSongMessage(guild, response).catch((e) => {
      logger.info("Error while setupSongMessage");
      logger.error(e);
    });
  }
}
