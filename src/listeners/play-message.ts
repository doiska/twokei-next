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
import { sendPresetMessage } from "@/lib/message-handler/helper";

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

      const hasMentions = message.mentions.members?.has(self);
      const contentOnly = message.content.replace(/<@!?\d+>/g, "").trim();

      if (!(await this.validateSongChannel(message))) {
        return;
      }

      await message.delete().catch(noop);

      if (!hasMentions) {
        await sendPresetMessage({
          interaction: message,
          message: ErrorCodes.MISSING_MESSAGE,
          preset: "error",
          i18n: {
            mention: container.client.user?.toString() ?? "@Twokei",
          },
        });
        return;
      }

      await playSong(message, contentOnly);
    } catch (e) {
      await sendPresetMessage({
        interaction: message,
        preset: "error",
        message: getReadableException(e),
      });
    }
  }

  private async validateSongChannel(message: Message) {
    const self = this.container.client.id;
    const { channel: typedChannel, guild } = message;

    if (!self || !guild || !typedChannel) {
      return false;
    }

    const hasMentions = message.mentions.members?.has(self);
    const songChannel = await container.sc.get(guild);

    if (!songChannel) {
      return false;
    }

    // TODO: fix, é possível que o songChannel não exista, deve ser validado antes!

    const isUsableChannel = songChannel?.channelId === typedChannel.id;

    if (!isUsableChannel) {
      if (!hasMentions) {
        return false;
      }

      if (!songChannel?.channelId) {
        await sendPresetMessage({
          interaction: message,
          preset: "error",
          message: ErrorCodes.MISSING_SONG_CHANNEL,
        });
      } else {
        await sendPresetMessage({
          interaction: message,
          preset: "error",
          message: ErrorCodes.USE_SONG_CHANNEL,
          i18n: {
            song_channel: songChannel?.channelId
              ? channelMention(songChannel.channelId)
              : "",
          },
        });
      }
      return false;
    }
    return true;
  }
}
