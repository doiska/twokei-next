import { eq } from 'drizzle-orm';

import { GuildResolvable } from 'discord.js';
import { container } from '@sapphire/framework';

import { SongChannel, songChannels } from '@/db/schemas/SongChannels';
import { kil } from '@/db/Kil';

export class SongChannelManager {
  private cache: Map<string, SongChannel>;

  public constructor() {
    this.cache = new Map();
  }

  public async set(
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

  public async get(guild: GuildResolvable): Promise<SongChannel | undefined> {
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
}
