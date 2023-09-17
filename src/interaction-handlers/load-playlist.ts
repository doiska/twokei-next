import type { ButtonInteraction } from "discord.js";
import { ButtonStyle, Colors, ComponentType, EmbedBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedLimits } from "@sapphire/discord.js-utilities";
import {
  InteractionHandler,
  InteractionHandlerTypes,
  type None,
  type Option,
} from "@sapphire/framework";
import { noop } from "@sapphire/utilities";

import { and, eq } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { songProfileSources } from "@/db/schemas/song-profile-sources";

import { Icons } from "@/constants/icons";
import { EmbedButtons } from "@/constants/music/player-buttons";
import { playSong } from "@/features/music/play-song";
import { Action, Pagination } from "@/lib/message-handler/pagination";
import type { ProfileWithPlaylists } from "@/music/resolvers/resolver";
import { spotifyProfileResolver } from "@/music/resolvers/spotify/spotify-profile-resolver";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { send } from "@/lib/message-handler";
import { Embed } from "@/utils/messages";

@ApplyOptions<InteractionHandler.Options>({
  name: "load-playlist",
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class LoadPlaylist extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    const sources = await this.fetchSources(interaction.user.id);

    if (!sources.length) {
      return this.sendError(interaction, "profile:profile_not_setup");
    }

    const profiles = await this.fetchProfiles(sources);

    if (!profiles.length) {
      return this.sendError(interaction, "commands:load-playlist.not_found");
    }

    const hasAnyTrack = profiles.some((profile) =>
      profile.items.some((s) => s.tracks.total),
    );

    if (!hasAnyTrack) {
      return this.sendError(
        interaction,
        "Você não possui playlists com músicas.",
      );
    }

    return await this.handlePagination(interaction, profiles);
  }

  private async fetchSources(userId: string) {
    return kil
      .select()
      .from(songProfileSources)
      .where(and(eq(songProfileSources.userId, userId)));
  }

  private async fetchProfiles(sources: any[]) {
    const promises = sources.map((source) => {
      if (source.source.toLowerCase() === "spotify") {
        return spotifyProfileResolver.getPlaylists(source.sourceUrl);
      }
      return null;
    });

    return (await Promise.all(promises)).filter(Boolean).flat();
  }

  private async sendError(interaction: ButtonInteraction, message: string) {
    await send(interaction, {
      embeds: Embed.error(message),
      ephemeral: true,
    });
  }

  private async handlePagination(
    interaction: ButtonInteraction,
    profiles: any[],
  ) {
    const pages = profiles.flatMap((profile) =>
      profile.items.map(this.createPageEmbed),
    );
    const playlists = profiles.flatMap((profile) => profile.items);
    const pagination = new Pagination(interaction, pages, [
      this.getMenu(playlists),
      ...this.getButtons(playlists),
    ]);

    try {
      await pagination.run();
    } catch (error) {
      await this.sendError(interaction, getReadableException(error));
    }
  }

  public parse(buttonInteraction: ButtonInteraction): Option<None> {
    if (buttonInteraction.customId === EmbedButtons.PLAYLIST_SYNC) {
      return this.some();
    }

    return this.none();
  }

  private getMenu(playlists: ProfileWithPlaylists["items"]): (
    context: Pagination,
  ) => {
    options: {
      default: boolean;
      description: string;
      label: string;
      value: string;
    }[];
    run: ({
      collectedInteraction,
      handler,
    }: {
      collectedInteraction: any;
      handler: any;
    }) => Promise<void>;
    placeholder: string;
    type: any;
    customId: string;
  } {
    return (context: Pagination) => {
      return {
        customId: "play-select-menu",
        type: ComponentType.StringSelect,
        placeholder: "Select a playlist",
        options: playlists.map((item, index) => ({
          label: item.name ?? "No name",
          value: `${index}`,
          description: item.description.substring(0, 100) ?? "",
          default: index === context.page,
        })),
        run: async ({ collectedInteraction, handler }) =>
          collectedInteraction.isStringSelectMenu() &&
          handler.setPage(parseInt(collectedInteraction.values[0], 10)),
      };
    };
  }

  private getButtons(response: ProfileWithPlaylists["items"]): Action[] {
    return [
      {
        label: "Anterior",
        customId: "previous",
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        run: async ({ collectedInteraction, handler }) => {
          await collectedInteraction.deferUpdate().catch(noop);

          if (handler.page === 0) {
            await handler.setPage(handler.pages.length - 1);
          } else {
            await handler.setPage(handler.page - 1);
          }
        },
      },
      {
        label: "Ouvir",
        customId: "play",
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        run: async ({
          collector,
          collectedInteraction: selectInteraction,
          handler,
        }) => {
          if (!selectInteraction.isButton()) {
            return;
          }

          const index = handler.page;

          const playlist = response?.[index];

          if (!playlist) {
            await selectInteraction.followUp("Playlist not found");
            return;
          }

          await playSong(selectInteraction, playlist.uri).catch(noop);

          collector.stop();
        },
      },
      {
        label: "Próxima",
        customId: "next",
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        run: async ({ collectedInteraction, handler }) => {
          await collectedInteraction.deferUpdate().catch(noop);

          if (handler.page >= handler.pages.length - 1) {
            await handler.setPage(0);
          } else {
            await handler.setPage(handler.page + 1);
          }
        },
      },
      (context) => {
        const current = response?.[context.page];
        return {
          label: "Ver no Spotify",
          url: current?.uri ?? "",
          type: ComponentType.Button,
          style: ButtonStyle.Link,
          emoji: Icons.SpotifyLogo,
        };
      },
    ];
  }

  private createPageEmbed(playlist: ProfileWithPlaylists["items"][number]) {
    return new EmbedBuilder()
      .setTitle(`${playlist.name}`.substring(0, EmbedLimits.MaximumTitleLength))
      .setAuthor({
        name: playlist.owner.name ?? "No display",
        url: playlist.owner.href,
      })
      .setColor(Colors.Aqua)
      .setFooter({
        text: `Spotify Playlist - ${playlist.tracks.total} músicas | https://twokei.com`,
      })
      .setThumbnail(playlist?.owner.images?.[0].url ?? null)
      .setImage(playlist?.images[0]?.url ?? null);
  }
}
