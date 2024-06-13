import { EmbedBuilder, Events, type Message, TextChannel } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  isGuildBasedChannel,
  isTextChannel,
} from "@sapphire/discord.js-utilities";
import { container, Listener } from "@sapphire/framework";
import { noop } from "@sapphire/utilities";

import { ErrorCodes, RawErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { Embed } from "@/utils/messages";
import { resolveKey } from "@/i18n";
import { isShoukakuReady } from "@/preconditions/shoukaku-ready";
import { youtubeResolver } from "@/music/resolvers/youtube";
import { addNewSong } from "@/music/functions/add-new-song";

import { logger } from "@/lib/logger";
import { dispose, stripContent } from "@/lib/message-handler/utils";
import { Icons } from "@/constants/icons";

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

      const songChannel = await container.sc.getEmbed(guild);

      const validation = await this.getMessageValidation(
        message,
        songChannel?.channel.id,
      );

      if (validation === "ignore") {
        return;
      }

      const validationError = errors?.[validation as keyof typeof errors];

      if (validationError || !songChannel) {
        await typedChannel
          .send({
            embeds: Embed.error(
              await resolveKey(message, validationError, {
                mention: container.client.user?.toString() ?? "@Twokei",
                channel: songChannel?.channel.toString() ?? "#twokei-music",
              }),
            ),
          })
          .then((errorMessage) => {
            dispose(errorMessage, 8000);
            dispose(message, 8000);
          })
          .catch(noop);

        return;
      }

      const contentOnly = stripContent(message.content);

      if (!contentOnly.length) {
        message
          .reply({
            embeds: Embed.error(
              await resolveKey(message, ErrorCodes.PLAYER_MISSING_INPUT),
            ),
          })
          .then((errorMessage) => {
            dispose(errorMessage, 8000);
            dispose(message, 8000);
          });

        return;
      }

      if (youtubeResolver.matches(contentOnly)) {
        message
          .reply({
            embeds: Embed.info(
              await resolveKey(message, "player:youtube_disabled"),
            ),
          })
          .then(dispose);
      }

      await addNewSong(contentOnly, member);

      if (validation === "not-in-song-channel") {
        await message
          .reply({
            embeds: Embed.success(
              `Acompanhe e controle a música no canal ${songChannel.channel.toString()}`,
            ),
          })
          .then(dispose);
      }

      await this.cleanupSongChannel(songChannel);
    } catch (e) {
      logger.error(
        `An unexpected error occurred (${message.guild?.id} - ${message.guild?.name})`,
        e,
      );

      await message.channel
        ?.send({
          embeds: [
            new EmbedBuilder().setDescription(
              [
                "## Ocorreu um erro ao criar o player de música.",
                "### Como resolver:",
                "- Confirme se o Twokei tem acesso a este canal de voz/texto",
                "- Convide-o novamente para o servidor (https://music.twokei.com)",
                `**${Icons.Hanakin} Sentimos pelo inconveniente.**`,
              ].join("\n"),
            ),
          ],
        })
        .then(dispose)
        .catch(logger.error);
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

  async getMessageValidation(message: Message, songChannelId?: string) {
    const { channel: typedChannel, guild } = message;

    if (!guild || !typedChannel) {
      return "no-channel";
    }

    const isInSongChannel = songChannelId === typedChannel.id;
    const hasAvailableContent = message.content.length > 0;

    if (isInSongChannel) {
      if (hasAvailableContent) {
        return "same-channel";
      }

      return "same-channel-no-mention";
    }

    // Caso tenha mencionado o Twokei, mas NÃO esteja no canal de música
    if (hasAvailableContent) {
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
}

void container.stores.loadPiece({
  name: "play-message-event",
  piece: PlayMessage,
  store: "listeners",
});
