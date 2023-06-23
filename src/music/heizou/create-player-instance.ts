import { Guild, TextChannel } from 'discord.js';

import { eq } from 'drizzle-orm';

import { Twokei } from '../../app/Twokei';
import { xiao } from '../../app/Xiao';
import { kil } from '../../db/Kil';
import { songChannels } from '../../db/schemas/SongChannels';
import { getGuidLocale } from '../../modules/guild-locale';

interface InitOptions {
  guild: Guild;
  voiceChannel: string;
}

export async function createPlayerInstance({ guild, voiceChannel }: InitOptions) {
  const player = xiao.getPlayer(guild.id);

  if (player) {
    return player;
  }

  const [songChannel] = await kil.select().from(songChannels).where(eq(songChannels.guildId, guild.id));

  const newPlayer = await xiao.createPlayer({
    guild: guild.id,
    voiceChannel: voiceChannel,
    lang: await getGuidLocale(guild.id)
  });

  if (songChannel) {
    const channel = await guild.channels.fetch(songChannel.channelId) as TextChannel;
    const message = await channel.messages.fetch(songChannel.messageId);

    if (channel && message) {
      await Twokei.xiao.embedManager.create(newPlayer, guild.id, message);
    }
  }

  return newPlayer;
}
