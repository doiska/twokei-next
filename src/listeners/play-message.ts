import { channelMention, Events, type Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  isGuildBasedChannel,
  isTextChannel,
} from "@sapphire/discord.js-utilities";
import { container, Listener } from "@sapphire/framework";
import { noop } from "@sapphire/utilities";

import { playSong } from "@/features/music/play-song";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { send } from "@/lib/message-handler";
import { Embed } from "@/utils/messages";
import { resolveKey } from "@sapphire/plugin-i18next";
import { logger } from "@/lib/logger";

@ApplyOptions<Listener.Options>({
  name: "play-message-event",
  event: Events.MessageCreate,
})
export class PlayMessage extends Listener<typeof Events.MessageCreate> {
  public override async run(message: Message) {
    const self = this.container.client.id;

    const { author, channel: typedChannel, member, guild } = message;

    if (!self || author.bot || !guild || !member) {
      return;
    }

    try {
      if (!isTextChannel(typedChannel) || !isGuildBasedChannel(typedChannel)) {
        return;
      }

      const contentOnly = message.content.replace(/<@!?\d+>/g, "").trim();
      const validation = await this.validateSongChannel(message);

      if (validation === "ignore") {
        return;
      }

      const errors = {
        "same-channel-no-mention": ErrorCodes.MISSING_MESSAGE,
        "different-channel": ErrorCodes.USE_SONG_CHANNEL,
        "no-channel": ErrorCodes.MISSING_SONG_CHANNEL,
      } as const;

      const validationError = errors?.[validation as keyof typeof errors];

      const songChannel = (await container.sc.get(message.guild!)) ?? null;

      if (validationError) {
        await send(message, {
          embeds: Embed.error(
            await resolveKey(message, validationError, {
              mention: container.client.user?.toString() ?? "@Twokei",
              channel: songChannel?.channelId
                ? channelMention(songChannel.channelId)
                : "#twokei-music",
            }),
          ),
        }).dispose(8000);

        await message.delete().catch(noop);
        return;
      }

      if (!contentOnly) {
        await send(message, {
          embeds: Embed.error(
            await resolveKey(message, ErrorCodes.PLAYER_MISSING_INPUT),
          ),
        }).dispose(8000);

        await message.delete().catch(noop);
        return;
      }

      await playSong(message, contentOnly);

      try {
        const deletableMessages = await message.channel.messages.fetch();

        if (!isTextChannel(message.channel)) {
          return;
        }

        await message.channel.bulkDelete(
          deletableMessages.filter((m) => m.id !== songChannel?.messageId),
          true,
        );
      } catch (e) {
        logger.warn(`Failed to bulk delete messages in ${message.channel.id}`);
      }
    } catch (e) {
      await send(message, {
        content: getReadableException(e),
      }).dispose();
    }
  }

  private async validateSongChannel(message: Message) {
    const self = this.container.client.id;
    const { channel: typedChannel, guild } = message;

    if (!self || !guild || !typedChannel) {
      return "no-channel";
    }

    const songChannel = await container.sc.get(guild).catch(() => null);
    const hasMentions = message.mentions.members?.has(self);

    if (hasMentions && songChannel?.channelId === typedChannel.id) {
      return "same-channel";
    } else if (songChannel?.channelId === typedChannel.id) {
      return "same-channel-no-mention";
    }

    if (hasMentions) {
      const channelExists = songChannel?.channelId
        ? await guild.channels.fetch(songChannel?.channelId).catch(() => null)
        : false;

      if (songChannel?.channelId && channelExists) {
        return "different-channel";
      }

      return "no-channel";
    }

    return "ignore";
  }
}
