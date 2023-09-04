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
import { type Action, Pagination } from "@/lib/Pagination";
import type { ProfileWithPlaylists } from "@/music/resolvers/resolver";
import { spotifyProfileResolver } from "@/music/resolvers/spotify/spotify-profile-resolver";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { sendPresetMessage } from "@/lib/message-handler/helper";

@ApplyOptions<InteractionHandler.Options>({
  name: "load-playlist",
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class LoadPlaylist extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    const sources = await kil
      .select()
      .from(songProfileSources)
      .where(and(eq(songProfileSources.userId, interaction.user.id)));

    if (!sources.length) {
      await sendPresetMessage({
        interaction,
        preset: "error",
        message: "profile:profile_not_setup",
        ephemeral: true,
      });
      return;
    }

    const promises = await Promise.all(
      sources.map(async (source) => {
        if (source.source.toLowerCase() === "spotify") {
          return spotifyProfileResolver.getPlaylists(source.sourceUrl);
        }

        return null;
      }),
    );

    const profiles = promises.filter(Boolean).flat();

    if (!profiles.length) {
      await sendPresetMessage({
        interaction,
        message: "commands:load-playlist.not_found",
        preset: "error",
      });
      return;
    }

    const hasAnyTrack = profiles.filter(
      (profile) => profile.items.filter((s) => s.tracks.total).length > 0,
    );

    if (!hasAnyTrack) {
      await sendPresetMessage({
        interaction,
        message: "Você não possui playlists com músicas.",
        preset: "error",
      });

      return;
    }

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
      await sendPresetMessage({
        interaction,
        message: getReadableException(error),
        preset: "error",
      });
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
        run: async ({ handler }) => {
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

          await playSong(selectInteraction, playlist.uri)
            .catch(async (response) => {
              const readable = getReadableException(response);

              return selectInteraction.followUp({
                content: readable,
                ephemeral: true,
              });
            })
            .finally(() => {
              selectInteraction.deleteReply().catch(noop);
            });

          collector.stop();
        },
      },
      {
        label: "Próxima",
        customId: "next",
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        run: async ({ handler }) => {
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
