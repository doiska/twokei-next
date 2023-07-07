import { Events, Guild } from 'discord.js';
import { Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

import { FriendlyException } from '@/structures/exceptions/FriendlyException';
import { logger } from '@/modules/logger-transport';
import { setupNewChannel } from '@/modules/config/setup-new-channel';
import { guilds } from '@/db/schemas/Guild';
import { kil } from '@/db/Kil';

@ApplyOptions<Listener.Options>({
  name: 'guild-setup-event',
  event: Events.GuildCreate,
})
export class GuildSetup extends Listener<Events.GuildCreate> {
  public async run(guild: Guild) {
    if (process.env.NODE_ENV !== 'production') {
      await guild.channels.fetch()
        .then((channels) => {
          channels
            .filter((channel) => channel?.name?.includes('song-requests'))
            .forEach((channel) => channel?.delete());
        });
    }

    logger.info(`Joined guild ${guild.name} (${guild.id})`);

    await kil
      .insert(guilds)
      .values({
        guildId: guild.id,
        name: guild.name,
        locale: guild.preferredLocale === 'pt-BR' ? 'pt_br' : 'en_us',
      })
      .onConflictDoUpdate({
        target: guilds.guildId,
        set: {
          name: guild.name,
        },
      });

    setupNewChannel(guild)
      .catch(async (e) => {
        logger.error(e);
        if (e instanceof FriendlyException) {
          const owner = await guild.fetchOwner();

          if (!owner) {
            return;
          }

          await owner.send(e.message);
        }
      });
  }
}
