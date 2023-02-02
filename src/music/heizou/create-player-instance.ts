import { Guild, TextChannel } from 'discord.js';
import { Twokei } from '../../app/Twokei';
import { SongChannelEntity } from '../../entities/SongChannelEntity';

interface InitOptions {
  guild: Guild;
  voiceChannel: string;
}

export async function createPlayerInstance({ guild, voiceChannel }: InitOptions) {
  const player = Twokei.xiao.getPlayer(guild.id);

  if (player) {
    return player;
  }

  const songChannel = await Twokei.dataSource.getRepository(SongChannelEntity)
    .findOne({
      where: {
        guild: guild.id
      }
    });

  if (songChannel) {
    const channel = await guild.channels.fetch(songChannel.channel) as TextChannel;
    const message = await channel.messages.fetch(songChannel.message);

    if (channel && message) {
      await Twokei.xiao.embedManager.create(guild.id, message);
    }
  }

  return Twokei.xiao.createPlayer({
    guild: guild.id,
    voiceChannel: voiceChannel,
  });
}
