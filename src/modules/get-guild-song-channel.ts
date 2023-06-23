import { GuildResolvable } from 'discord.js';

import { eq } from 'drizzle-orm';

import { Twokei } from '../app/Twokei';
import { kil } from '../db/Kil';
import { songChannels } from '../db/schemas/SongChannels';

export async function getGuildSongChannel(guild: GuildResolvable) {
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