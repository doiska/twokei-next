import { channelMention, Events, type Message } from "discord.js";
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
import { validateSongChannel } from "@/listeners/play/validate-sc-message";
import { cleanupSongChannel } from "@/listeners/play/cleanup-sc";

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

      const validation = await validateSongChannel(
        message,
        songChannel?.channel.id,
      );

      if (validation === "ignore") {
        return;
      }

      const validationError = errors?.[validation as keyof typeof errors];

      if (validationError) {
        await send(message, {
          embeds: Embed.error(
            await resolveKey(message, validationError, {
              mention: container.client.user?.toString() ?? "@Twokei",
              channel: songChannel?.channel.id
                ? channelMention(songChannel.channel.id)
                : "#twokei-music",
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

      await cleanupSongChannel(songChannel!.channel, songChannel!.message.id!);
    } catch (e) {
      const exception = getReadableException(e);

      await send(message, {
        content: (await resolveKey(message, exception, {
          defaultValue: exception,
        })) satisfies string,
      }).dispose();
    }
  }
}
