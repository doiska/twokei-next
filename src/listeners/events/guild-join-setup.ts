import { Events } from 'discord.js';

import { createEvent } from 'twokei-framework';

import { kil } from '../../db/Kil';
import { guilds } from '../../db/schemas/Guild';
import { setupNewChannel } from '../../modules/config/setup-new-channel';
import { FriendlyException } from '../../structures/exceptions/FriendlyException';
import { noop } from '../../utils/dash-utils';

export const guildJoin = createEvent(Events.GuildCreate, async guild => {

  await guild.channels.fetch().then(channels => {
    channels
      .filter(channel => channel?.name?.includes('song-requests'))
      .forEach(channel => channel?.delete());
  });

  await kil.insert(guilds).values({
    guildId: guild.id,
    name: guild.name,
    locale: guild.preferredLocale === 'pt-BR' ? 'pt_br' : 'en_us'
  }).onConflictDoUpdate({
    target: guilds.guildId,
    set: {
      name: guild.name
    }
  });

  setupNewChannel(guild).then(noop).catch(async e => {
    if (e instanceof FriendlyException) {
      const owner = await guild.fetchOwner();

      if (!owner) {
        return;
      }

      await owner.send(e.message);
    }
  });
});