import { Twokei } from '../app/Twokei';
import { SongChannelEntity } from '../entities/SongChannelEntity';
import { ChannelType, Guild } from 'discord.js';

export const createGuildChannel = async (guild: Guild) => {
  try {
    const song_channel = await guild.channels.create({
      name: 'twokei-music',
      type: ChannelType.GuildText,
      topic: 'Twokei Music Channel',
    })


  } catch (error) {

  }
}

export const getGuildMessage = async (guildId: string) => {
  const guild = await Twokei.dataSource.getRepository(SongChannelEntity).findOne({
    where: {
      guild: guildId
    }
  });

}