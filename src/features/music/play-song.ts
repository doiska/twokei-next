import type { ModalSubmitInteraction, RepliableInteraction } from "discord.js";
import { channelMention, Message } from "discord.js";
import { isGuildMember, isTextChannel } from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";

import { createPlayEmbed } from "@/constants/music/create-play-embed";
import { addNewSong } from "@/music/heizou/add-new-song";
import { youtubeTrackResolver } from "@/music/resolvers/youtube/youtube-track-resolver";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { Embed } from "@/utils/messages";
import { sendPresetMessage } from "@/lib/message-handler/helper";

import { resolveKey } from "@sapphire/plugin-i18next";
import { send } from "@/lib/message-handler";

export async function playSong(
  interaction: Exclude<RepliableInteraction, ModalSubmitInteraction> | Message,
  query: string,
) {
  const { guild } = interaction;

  if (!guild || !interaction.member || !isGuildMember(interaction.member)) {
    return;
  }

  const { channelId } = (await container.sc.get(guild)) ?? {};

  if (!channelId) {
    await sendPresetMessage({
      interaction,
      preset: "error",
      message: ErrorCodes.MISSING_SONG_CHANNEL,
      ephemeral: true,
    });
    return;
  }

  const songChannel = await guild.channels.fetch(channelId).catch(() => null);
  const isSongChannel = interaction.channel?.id === channelId;

  if (!songChannel || !isTextChannel(songChannel)) {
    await sendPresetMessage({
      interaction,
      preset: "error",
      message: ErrorCodes.MISSING_SONG_CHANNEL,
    });
    return;
  }

  const isYouTubeLink = youtubeTrackResolver.matches(query);

  if (isYouTubeLink) {
    const warning = Embed.info(
      await resolveKey(interaction, "player:youtube_disabled"),
    );

    await send(interaction, {
      embeds: [warning],
    }).dispose(5000);
  }

  try {
    const result = await addNewSong(query, interaction.member);

    const mentionedChannel = songChannel.id
      ? channelMention(songChannel.id)
      : "#twokei-music";

    if (!isSongChannel) {
      await sendPresetMessage({
        interaction,
        preset: "success",
        message: `Acompanhe e controle a música no canal ${mentionedChannel}`,
      });
    }

    await send(
      interaction,
      await createPlayEmbed(interaction.member, result),
    ).dispose(60000);
  } catch (error) {
    await send(interaction, {
      embeds: [
        Embed.error(await resolveKey(interaction, getReadableException(error))),
      ],
      ephemeral: true,
    }).dispose();
  }
}
