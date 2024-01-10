import { type Guild, type GuildResolvable } from "discord.js";
import {
  isGuildBasedChannel,
  isTextChannel,
} from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";

import { eq } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { playerSongChannels } from "@/db/schemas/player-song-channels";

import { createDefaultEmbed } from "@/music/song-channel/embed/pieces";
import { logger } from "@/lib/logger";

export class SongChannelManager {
  public async set(guildId: string, channelId: string, messageId: string) {
    const [result] = await kil
      .insert(playerSongChannels)
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
        target: playerSongChannels.guildId,
      })
      .returning();

    return result;
  }

  public async get(guild: GuildResolvable) {
    const guildId = container.client.guilds.resolveId(guild);

    if (!guildId) {
      return;
    }

    const [result] = await kil
      .select()
      .from(playerSongChannels)
      .where(eq(playerSongChannels.guildId, guildId));

    return result;
  }

  public async reset(guild: Guild) {
    const embed = await this.getEmbed(guild);

    if (!embed) {
      return;
    }

    await embed.message.edit(await createDefaultEmbed(guild));
  }

  public async getEmbed(guild: Guild) {
    const songChannel = await this.get(guild.id);

    if (!songChannel) {
      return;
    }

    try {
      const channel = await guild.channels.fetch(songChannel.channelId, {
        force: true,
      });

      if (!isGuildBasedChannel(channel) || !isTextChannel(channel)) {
        return;
      }

      const message = await channel.messages.fetch(songChannel.messageId);

      return {
        message,
        channel,
      };
    } catch (e) {
      logger.error(e);
    }
  }
}
