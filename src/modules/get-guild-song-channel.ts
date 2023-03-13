import { GuildResolvable } from 'discord.js';
import { Twokei } from '../app/Twokei';
import { SongChannelEntity } from '../entities/SongChannelEntity';

export async function getGuildSongEntity(guild: GuildResolvable): Promise<SongChannelEntity> {
  const id = Twokei.guilds.resolveId(guild);

  if (!id) {
    throw new Error(`Invalid guild: ${guild}`);
  }

  const entity = await Twokei.dataSource.getRepository(SongChannelEntity).findOne({
    where: {
      guild: id
    }
  });

  if (!entity) {
    throw new Error(`No song channel found for guild: ${id}`);
  }

  const resolvedChannel = await Twokei.channels.fetch(entity.channel);

  if (!resolvedChannel) {
    throw new Error(`Invalid channel: ${entity.channel}`);
  }

  return entity;
}