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

      if (!hasMentions) {
        await send(message, {
          embeds: Embed.error(
            await resolveKey(message, ErrorCodes.MISSING_MESSAGE, {
              mention: container.client.user?.toString() ?? "@Twokei",
            }),
          ),
        }).dispose();

        return;
      }

      await playSong(message, contentOnly);
      await message.delete().catch(noop);
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
      return false;
    }

    const hasMentions = message.mentions.members?.has(self);
    const songChannel = await container.sc.get(guild);

    if (!songChannel) {
      return false;
    }

    //TODO: checar se o canal existe antes de sugerir usar.

    const isUsableChannel = songChannel?.channelId === typedChannel.id;

    if (!isUsableChannel) {
      if (!hasMentions) {
        return false;
      }

      if (!songChannel?.channelId) {
        await send(message, {
          embeds: Embed.error(
            await resolveKey(message, ErrorCodes.MISSING_SONG_CHANNEL),
          ),
        }).dispose();
      } else {
        await send(message, {
          embeds: Embed.error(
            await resolveKey(message, ErrorCodes.USE_SONG_CHANNEL, {
              song_channel: channelMention(songChannel.channelId),
            }),
          ),
        }).dispose();
      }
      return false;
    }
    return true;
  }
}
