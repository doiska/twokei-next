import { container, Listener } from "@sapphire/framework";
import {
  Events,
  XiaoLoadType,
  XiaoSearchResult,
} from "@/music/interfaces/player.types";
import type { Venti } from "@/music/controllers/Venti";
import { dispose } from "@/lib/message-handler/utils";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { fetchT, TFunction } from "@/i18n";
import { addMilliseconds, format } from "date-fns";
import { LoadType } from "@twokei/shoukaku";
import { capitalizeFirst } from "@/utils/helpers";
import { inlineCode } from "@discordjs/formatters";
import { logger } from "@/lib/logger";

@ApplyOptions<Listener.Options>({
  name: "song-added-event",
  event: Events.TrackAdd,
  emitter: container.xiao,
  enabled: true,
})
export class SongAdded extends Listener<typeof Events.TrackAdd> {
  private translate!: TFunction;
  private searchResult!: XiaoSearchResult;

  public async run(
    venti: Venti,
    result: XiaoSearchResult,
    requester?: GuildMember,
  ) {
    this.translate = await fetchT(venti.guild);
    this.searchResult = result;

    const songChannel = await container.sc.getEmbed(venti.guild);

    if (!songChannel) {
      return;
    }

    const embed =
      this.searchResult.type === LoadType.PLAYLIST
        ? this.getPlaylistEmbed()
        : this.getTrackEmbed();

    if (!embed) {
      logger.error(
        `Could not get embed for ${this.searchResult.type} at ${venti.guild.name}`,
      );
      return;
    }

    const source = this.getSource();

    if (requester) {
      embed.setAuthor({
        name: `${requester.displayName}`,
        iconURL: requester.user.displayAvatarURL(),
      });
    }

    embed.setColor(Colors.Blurple);

    songChannel.channel
      .send({
        embeds: [embed],
        components: [
          new ActionRowBuilder<ButtonBuilder>({
            components: source ? [source] : [],
          }),
        ],
      })
      .then((message) => dispose(message, 60000));
  }

  private getTrackEmbed() {
    const [track] = this.searchResult.tracks;

    const artwork = track.artworkUrl?.startsWith("http")
      ? track.artworkUrl
      : null;

    const duration = this.formatMillis(track?.length ?? 0);

    return new EmbedBuilder()
      .setThumbnail(artwork)
      .setDescription(
        [
          `### ${this.translate("player:play.added_to_queue")}`,
          `(${duration}) **[${track.title} - ${track.author}](${track.uri})**`,
        ].join("\n"),
      );
  }

  private getPlaylistEmbed() {
    if (this.searchResult.type !== XiaoLoadType.PLAYLIST_LOADED) {
      return;
    }

    const maxShownTracks = 5;
    const hasMoreTracks = this.searchResult.tracks.length - maxShownTracks > 0;

    const tracks = this.searchResult.tracks
      .slice(0, maxShownTracks)
      .map((track) => {
        const duration = this.formatMillis(track.length ?? 0);
        return `- (${duration}) [${track.title}](${track.uri}) - ${track.author}`;
      });

    const moreTracks =
      hasMoreTracks &&
      this.translate("player:play.more_songs", {
        amount: this.searchResult.tracks.length - maxShownTracks,
      });

    const title = inlineCode(this.searchResult.playlist.name ?? "");

    return new EmbedBuilder().setDescription(
      [`### ${title}`, ...tracks, moreTracks].filter(Boolean).join("\n"),
    );
  }

  private getSource() {
    const sourceName =
      this.searchResult.type === LoadType.PLAYLIST
        ? this.searchResult.tracks[0].sourceName
        : this.searchResult.tracks[0].sourceName;

    const url =
      this.searchResult.type === LoadType.PLAYLIST
        ? this.searchResult.playlist.url
        : this.searchResult.tracks[0].uri;

    if (!sourceName || !url) {
      return;
    }

    return new ButtonBuilder()
      .setLabel(
        this.translate(`player:play.buttons.view_source`, {
          source: capitalizeFirst(sourceName ?? ""),
        }),
      )
      .setURL(url ?? "")
      .setStyle(ButtonStyle.Link);
  }

  private formatMillis(millis: number) {
    const referenceDate = new Date(0);
    const newDate = addMilliseconds(referenceDate, millis);

    return format(newDate, "mm:ss");
  }
}

void container.stores.loadPiece({
  name: "song-added",
  piece: SongAdded,
  store: "listeners",
});
