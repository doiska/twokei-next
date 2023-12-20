import { Events, type Message, TextChannel } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  isGuildBasedChannel,
  isTextChannel,
} from "@sapphire/discord.js-utilities";
import { container, Listener } from "@sapphire/framework";
import { noop } from "@sapphire/utilities";

import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { followUp, send } from "@/lib/message-handler";
import { Embed } from "@/utils/messages";
import { resolveKey } from "@sapphire/plugin-i18next";
import { isShoukakuReady } from "@/preconditions/shoukaku-ready";
import { youtubeTrackResolver } from "@/music/resolvers/youtube/youtube-track-resolver";
import { addNewSong } from "@/music/heizou/add-new-song";
import { createPlayEmbed } from "@/constants/music/create-play-embed";

import { logger } from "@/lib/logger";

const errors = {
  "same-channel-no-mention": ErrorCodes.MISSING_MESSAGE,
  "song-channel-does-not-exists": ErrorCodes.MISSING_SONG_CHANNEL,
} as const;

@ApplyOptions<Listener.Options>({
  name: "play-message-event",
  event: Events.MessageCreate,
})
export class PlayMessage extends Listener<typeof Events.MessageCreate> {
  public override async run(message: Message) {
    const { author, channel: typedChannel, member, guild } = message;

    if (author.bot || !guild || !member || !isShoukakuReady()) {
      return;
    }

    try {
      if (!isTextChannel(typedChannel) || !isGuildBasedChannel(typedChannel)) {
        return;
      }

      const songChannel = await container.sc.getEmbed(message.guild!);

      const validation = await this.validateSongChannel(
        message,
        songChannel?.channel.id,
      );

      if (validation === "ignore") {
        return;
      }

      const validationError = errors?.[validation as keyof typeof errors];

      if (validationError || !songChannel) {
        await send(message, {
          embeds: Embed.error(
            await resolveKey(message, validationError, {
              mention: container.client.user?.toString() ?? "@Twokei",
              channel: songChannel?.channel.toString() ?? "#twokei-music",
            }),
          ),
        }).dispose(8000);

        await message.delete().catch(noop);
        return;
      }

      const contentOnly = message.content.replace(/<@!?\d+>/g, "").trim();

      if (!contentOnly) {
        await send(message, {
          embeds: Embed.error(
            await resolveKey(message, ErrorCodes.PLAYER_MISSING_INPUT),
          ),
        }).dispose(8000);

        await message.delete().catch(noop);
        return;
      }

      if (youtubeTrackResolver.matches(contentOnly)) {
        await followUp(message, {
          embeds: Embed.info(
            await resolveKey(message, "player:youtube_disabled"),
          ),
        }).dispose(5000);
      }

      const result = await addNewSong(contentOnly, member);

      if (validation === "not-in-song-channel") {
        const mentionedChannel =
          songChannel?.channel.toString() ?? "#twokei-music";

        await send(message, {
          embeds: Embed.success(
            `Acompanhe e controle a música no canal ${mentionedChannel}`,
          ),
        });
      }

      songChannel?.channel
        .send(await createPlayEmbed(member, result))
        .then((message) => {
          setTimeout(() => {
            message.delete().catch(noop);
          }, 60000);
        });

      await this.cleanupSongChannel(songChannel);
    } catch (e) {
      const exception = getReadableException(e);

      await send(message, {
        content: (await resolveKey(message, exception, {
          defaultValue: exception,
        })) satisfies string,
      }).dispose();
    }
  }

  private async cleanupSongChannel({
    message,
    channel,
  }: {
    message: Message;
    channel: TextChannel;
  }) {
    try {
      const deletableMessages = await channel.messages.fetch();

      await channel.bulkDelete(
        deletableMessages.filter((m) => {
          const duration = Date.now() - m.createdTimestamp;
          const isMine = m.author.id === container.client.id;

          const isRecent = duration < 60000 && isMine;
          const isSongChannelMessage = m.id === message.id;

          return !isRecent && !isSongChannelMessage;
        }),
        true,
      );
    } catch (e) {
      logger.warn(
        `Failed to bulk delete messages in ${channel.id} (${channel.guild.id})`,
        e,
      );
    }
  }

  async validateSongChannel(message: Message, songChannelId?: string) {
    const { channel: typedChannel, guild } = message;

    if (!guild || !typedChannel) {
      return "no-channel";
    }

    const hasMentionedTwokei = message.mentions.members?.has(
      container.client.id!,
    );

    const isInSongChannel = songChannelId === typedChannel.id;

    if (!isInSongChannel) {
      // Caso tenha mencionado o Twokei, mas NÃO esteja no canal de música
      if (hasMentionedTwokei) {
        // Caso o canal de música não exista
        if (!songChannelId) {
          return "song-channel-does-not-exists";
        }

        // Caso o canal de música exista, mas não seja o canal atual
        return "not-in-song-channel";
      }

      // Caso NÃO tenha mencionado o Twokei e também NÃO esteja no canal de música
      return "ignore";
    }

    if (hasMentionedTwokei) {
      return "same-channel";
    }

    return "same-channel-no-mention";
  }
}
