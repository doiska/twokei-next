import { GuildResolvable } from 'discord.js';
import { Twokei } from '../app/Twokei';
import { kil } from '../app/Kil';
import { songChannels } from '../schemas/SongChannels';
import { eq } from 'drizzle-orm';

export async function getGuildSongEntity(guild: GuildResolvable) {
  const id = Twokei.guilds.resolveId(guild);

  if (!id) {
    throw new Error(`Invalid guild: ${guild}`);
  }

  const [entity] = await kil.select()
    .from(songChannels)
    .where(eq(songChannels.guildId, id));

  if (!entity) {
    throw new Error(`No song channel found for guild: ${id}`);
  }

  const resolvedChannel = await Twokei.channels.fetch(entity.channelId);

  if (!resolvedChannel) {
    throw new Error(`Invalid channel: ${entity.channelId}`);
  }

  return entity;
}