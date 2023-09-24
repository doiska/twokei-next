import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  type GuildMember,
  type Message,
} from "discord.js";

import { OnPlayButtons } from "@/constants/music/player-buttons";
import type { XiaoSearchResult } from "@/music/interfaces/player.types";
import { Embed } from "@/utils/messages";

import { fetchT, resolveKey, TFunction } from "@sapphire/plugin-i18next";
import { inlineCode } from "@discordjs/formatters";
import { addMilliseconds, format } from "date-fns";
import { send } from "@/lib/message-handler";
import { XiaoLoadType } from "@/music/interfaces/player.types";

export const createPlayEmbed = async (
  member: GuildMember,
  result: XiaoSearchResult,
) => {
  const t = await fetchT(member.guild);
  const [track] = result.tracks;

  const capitalizedSource =
    track.sourceName.charAt(0).toUpperCase() + track.sourceName.slice(1);

  const [viewSource] = ["view_source"].map((button) =>
    t(`player:play.buttons.${button}`, { source: capitalizedSource }),
  );

  const sourceUrl =
    result.type === XiaoLoadType.PLAYLIST_LOADED &&
    result.playlist.url.startsWith("http")
      ? result.playlist.url
      : track.uri;

  const viewOnSource = sourceUrl
    ? [
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel(viewSource)
          .setURL(sourceUrl),
      ]
    : [];

  const feedbackRow = new ActionRowBuilder<ButtonBuilder>({
    components: viewOnSource,
  });

  const embed =
    getPlaylistDescription(result, t) ?? getTrackDescription(result, t);

  embed.setAuthor({
    name: `${member.displayName}`,
    iconURL: member.user.displayAvatarURL(),
  });

  const responseEmbed = Embed.success(embed.data);

  return {
    embeds: responseEmbed,
    components: [feedbackRow],
  };
};

function getTrackDescription(result: XiaoSearchResult, t: TFunction) {
  const track = result.tracks[0];

  return new EmbedBuilder()
    .setThumbnail(track.thumbnail ?? "")
    .setDescription(
      [
        `### ${t("player:play.added_to_queue")}`,
        `(${formatMillis(track.duration ?? 0)}) **[${track.title} - ${
          track.author
        }](${track.uri})**`,
      ].join("\n"),
    );
}

function getPlaylistDescription(result: XiaoSearchResult, t: TFunction) {
  if (result.type !== XiaoLoadType.PLAYLIST_LOADED) {
    return;
  }

  const maxShownTracks = 5;
  const hasMoreTracks = result.tracks.length - maxShownTracks > 0;

  const tracks = result.tracks
    .slice(0, maxShownTracks)
    .map(
      (track) =>
        `- (${formatMillis(track.duration ?? 0)}) [${track.title}](${
          track.uri
        }) - ${track.author}`,
    );

  const moreTracks =
    hasMoreTracks &&
    t("player:play.more_songs", {
      amount: result.tracks.length - maxShownTracks,
    });

  return new EmbedBuilder().setDescription(
    [`### ${inlineCode(result.playlist.name)}`, ...tracks, moreTracks]
      .filter(Boolean)
      .join("\n"),
  );
}

function formatMillis(millis: number) {
  const referenceDate = new Date(0);

  const newDate = addMilliseconds(referenceDate, millis);

  return format(newDate, "mm:ss");
}

export async function waitFeedback(message: Message) {
  const collector = message.createMessageComponentCollector({
    filter: (i: ButtonInteraction) =>
      [OnPlayButtons.LIKE, OnPlayButtons.DISLIKE].includes(i.customId),
    componentType: ComponentType.Button,
    time: 60000,
  });

  collector.on("collect", async (i: ButtonInteraction) => {
    await send(i, {
      embeds: Embed.success(await resolveKey(i, "player:play.feedback")),
      ephemeral: true,
    });
  });

  return collector;
}
