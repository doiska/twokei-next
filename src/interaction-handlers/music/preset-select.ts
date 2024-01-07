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
import { addResolvableTrack } from "@/music/heizou/add-new-song";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";
import { logger } from "@/lib/logger";
import * as fs from "fs";

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

    const [{ search, market }] = await kil
      .select()
      .from(playerPresets)
      .where(eq(playerPresets.id, option));

    logger.debug(`PresetSelect: Searching for ${search} in ${market}`);

    const result = await Spotify.search(
      `${search} locale:pt_br`,
      ["playlist"],
      market ?? "US",
      20,
    );

    fs.writeFileSync("./test.json", JSON.stringify(result, null, 2));

    const names = result?.playlists?.items?.map((item) => item.name);

    logger.debug(`PresetSelect: Found ${names?.join(", ")}`);

    const playlists = result?.playlists?.items ?? [];

    if (!playlists.length) {
      return;
    }

    const playlist = await Spotify.playlists.getPlaylist(playlists[0].id);

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

    await addResolvableTrack(
      resolvableTracks,
      interaction.member as GuildMember,
    );

    const embed = new EmbedBuilder()
      .setDescription(
        `Added **${playlist.tracks.total}** tracks from **${playlist.name}**`,
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
