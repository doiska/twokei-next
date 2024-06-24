import { Events, type Guild } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";

import { sql } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { coreGuilds } from "@/db/schemas/core-guilds";

import { setupNewChannel } from "@/music/song-channel/setup-new-channel";
import { logger } from "@/lib/logger";

@ApplyOptions<Listener.Options>({
  name: "guild-setup-event",
  event: Events.GuildCreate,
  enabled: true,
})
export class GuildSetup extends Listener<Events.GuildCreate> {
  public onLoad() {
    logger.info("Loading guild setup listener...");
  }

  public async run(guild: Guild) {
    logger.info(
      `Joined guild ${guild.name} (${guild.id}) with ${guild.memberCount} members.`,
    );

    try {
      const guildLocale = "pt_br";

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

      await setupNewChannel(guild);
    } catch (e) {
      logger.error(
        `Error while setting up guild (on join) ${guild.name} (${guild.id})`,
        e,
      );
    }
  }
}

void container.stores.loadPiece({
  name: "guild-setup-event",
  piece: GuildSetup,
  store: "listeners",
});
