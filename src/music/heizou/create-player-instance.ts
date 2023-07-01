import {
  isGuildBasedChannel,
  isMessageInstance,
  isTextChannel,
} from '@sapphire/discord.js-utilities';
import { Guild } from 'discord.js';

import { xiao } from '@/app/Xiao';
import { kil } from '@/db/Kil';
import { songChannels } from '@/db/schemas/SongChannels';
import { getGuidLocale } from '@/modules/guild-locale';
import { eq } from 'drizzle-orm';

interface InitOptions {
  guild: Guild;
  voiceChannel: string;
}

export async function createPlayerInstance({
  guild,
  voiceChannel,
}: InitOptions) {
  const player = xiao.getPlayer(guild.id);

  if (player) {
    return player;
  }

  const newPlayer = await xiao.createPlayer({
    guild: guild.id,
    voiceChannel,
    lang: await getGuidLocale(guild.id),
  });

  const [songChannel] = await kil
    .select()
    .from(songChannels)
    .where(eq(songChannels.guildId, guild.id));

  if (songChannel) {
    const channel = await guild.channels
      .fetch(songChannel.channelId)
      .catch(() => null);

    if (isGuildBasedChannel(channel) && isTextChannel(channel)) {
      const message = await channel.messages
        .fetch(songChannel.messageId)
        .catch(() => null);

      if (message && isMessageInstance(message)) {
        await xiao.embedManager.create(newPlayer, guild.id, message);
      }
    }
  }

  return newPlayer;
}
