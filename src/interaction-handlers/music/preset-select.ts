import {
  EmbedBuilder,
  GuildMember,
  type StringSelectMenuInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";

import { Menus } from "@/constants/music/player-buttons";

import { Spotify } from "@/music/resolvers/spotify/spotify-revamp";
import { kil } from "@/db/Kil";
import { playerPresets } from "@/db/schemas/player-presets";
import { eq } from "drizzle-orm";
import type { Track as SpotifyTrack } from "@spotify/web-api-ts-sdk";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";
import { logger } from "@/lib/logger";

import { playerPlaylists } from "@/db/schemas/player-playlists";

@ApplyOptions<InteractionHandler.Options>({
  name: "preset-select-menu",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.SelectMenu,
})
export class PresetSelectMenuInteraction extends InteractionHandler {
  public override parse(interaction: StringSelectMenuInteraction) {
    const [value] = interaction.values ?? [];

    if (!value || interaction.customId !== Menus.PresetMenu) {
      return this.none();
    }

    return this.some(value);
  }

  public override async run(
    interaction: StringSelectMenuInteraction,
    option: InteractionHandler.ParseResult<this>,
  ) {
    if (!interaction.guild || !interaction.guildId || !option) {
      return;
    }

    const [preset] = await kil
      .select()
      .from(playerPresets)
      .where(eq(playerPresets.id, option.toLowerCase()));

    if (!preset?.categories?.length) {
      return;
    }

    const selectedCategory = preset.categories
      .sort(() => Math.random() - Math.random())
      .at(0)!;

    logger.debug(`Selected category ${selectedCategory}`, {
      preset,
      selectedCategory,
    });

    const [playlistCategory] = await kil
      .select()
      .from(playerPlaylists)
      .where(eq(playerPlaylists.id, selectedCategory));

    if (!playlistCategory) {
      logger.error(`No playlist found for category ${selectedCategory}`, {
        playlistCategory,
      });
      return;
    }

    const playlist = await Spotify.playlists.getPlaylist(playlistCategory.id);

    const isTrack = (track: any): track is SpotifyTrack =>
      track?.type === "track";

    const tracks = playlist.tracks.items
      .map((item) => item.track)
      .filter((t) => isTrack(t)) as SpotifyTrack[];

    const resolvableTracks = tracks.map((track) => {
      return new ResolvableTrack({
        encoded: "",
        info: {
          sourceName: "spotify",
          title: track.name,
          identifier: track.id,
          author: track.artists[0] ? track.artists[0].name : "Unknown",
          length: track.duration_ms,
          isSeekable: true,
          isStream: false,
          position: 0,
          uri: `https://open.spotify.com/track/${track.id}`,
          isrc: track.external_ids.isrc,
          artworkUrl: track.album.images[0].url,
        },
      });
    });

    const embed = new EmbedBuilder()
      .setDescription(
        [
          `Added **${playlist.tracks.total}** tracks from **${playlist.name}**`,
          ...playlist.tracks.items.map((item) => item.track.name),
        ].join("\n"),
      )
      .setThumbnail(playlist.images[0].url)
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
}

void container.stores.loadPiece({
  name: "preset-select-menu",
  piece: PresetSelectMenuInteraction,
  store: "interaction-handlers",
});
