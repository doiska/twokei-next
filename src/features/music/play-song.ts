import type {
  APIInteractionGuildMember,
  GuildMember,
  ModalSubmitInteraction,
  RepliableInteraction,
} from "discord.js";
import { Message } from "discord.js";
import { isGuildMember, isTextChannel } from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";

import { createPlayEmbed } from "@/constants/music/create-play-embed";
import { addNewSong } from "@/music/heizou/add-new-song";
import { youtubeTrackResolver } from "@/music/resolvers/youtube/youtube-track-resolver";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { Embed } from "@/utils/messages";

import { resolveKey } from "@sapphire/plugin-i18next";
import { defer, followUp, send } from "@/lib/message-handler";
import { noop } from "@sapphire/utilities";

export async function playSong(
  interaction: Exclude<RepliableInteraction, ModalSubmitInteraction> | Message,
  query: string,
  options?: {
    member?: GuildMember | null | APIInteractionGuildMember;
  },
) {
  const { guild } = interaction;
  const member = options?.member ?? interaction.member;

  if (!guild || !member || !isGuildMember(member)) {
    return;
  }

  await defer(interaction);

  const { channelId } = (await container.sc.get(guild)) ?? {};

  if (!channelId) {
    await send(interaction, {
      embeds: Embed.error(
        await resolveKey(interaction, ErrorCodes.MISSING_SONG_CHANNEL),
      ),
    });
    return;
  }

  const songChannel = await guild.channels.fetch(channelId).catch(() => null);

  if (!songChannel || !isTextChannel(songChannel)) {
    await send(interaction, {
      embeds: Embed.error(
        await resolveKey(interaction, ErrorCodes.MISSING_SONG_CHANNEL),
      ),
    });
    return;
  }

  const isYouTubeLink = youtubeTrackResolver.matches(query);

  if (isYouTubeLink) {
    const warning = Embed.info(
      await resolveKey(interaction, "player:youtube_disabled"),
    );

    await followUp(interaction, {
      embeds: warning,
    }).dispose(5000);
  }

  try {
    const result = await addNewSong(query, member);

    songChannel
      .send(await createPlayEmbed(member, result))
      .then((message) => {
        setTimeout(() => {
          message.delete().catch(noop);
        }, 60000);
      })
      .catch(noop);
  } catch (error) {
    await send(interaction, {
      embeds: Embed.error(
        await resolveKey(interaction, getReadableException(error)),
      ),
    }).dispose();
  }
}
