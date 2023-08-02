import { type Guild, type GuildResolvable } from 'discord.js';
import { isGuildBasedChannel, isTextChannel } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';

import { kil } from '@/db/Kil';
import { type SongChannel, songChannels } from '@/db/schemas/song-channels';
import { createDefaultEmbed } from '@/music/embed/pieces';

import { eq } from 'drizzle-orm';

export class SongChannelManager {
  private readonly cache = new Map<string, SongChannel>();

  public async set (
    guildId: string,
    channelId: string,
    messageId: string,
  ): Promise<SongChannel> {
    const [result] = await kil
      .insert(songChannels)
      .values({
        guildId,
        channelId,
        messageId,
      })
      .onConflictDoUpdate({
        set: {
          channelId,
          messageId,
        },
        target: songChannels.guildId,
      })
      .returning();

    this.cache.set(guildId, result);
    return result;
  }

  public async get (guild: GuildResolvable): Promise<SongChannel | undefined> {
    const guildId = container.client.guilds.resolveId(guild);

    if (!guildId) {
      return;
    }

    if (this.cache.has(guildId)) {
      return this.cache.get(guildId);
    }

    const [result] = await kil.select()
      .from(songChannels)
      .where(eq(songChannels.guildId, guildId));

    if (!result) {
      return;
    }

    this.cache.set(guildId, result);
    return result;
  }

  public async reset (guild: Guild) {
    const embed = await this.getEmbed(guild);

    if (!embed) {
      return;
    }

    const { message } = embed;

    await message.edit(await createDefaultEmbed(guild));
  }

  public async getEmbed (guild: Guild) {
    const songChannel = await this.get(guild.id);

    if (!songChannel) {
      return;
    }

    const channel = await guild.channels
      .fetch(songChannel.channelId)
      .catch(() => null);

    if (!isGuildBasedChannel(channel) || !isTextChannel(channel)) {
      return;
    }

    const message = await channel.messages
      .fetch(songChannel.messageId)
      .catch(() => null);

    if (!message) {
      return;
    }

    return {
      message,
      channel,
    };
  }
}
