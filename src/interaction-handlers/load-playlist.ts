import type { ButtonInteraction, Message, User } from 'discord.js';
import { ButtonStyle, Colors, ComponentType, EmbedBuilder } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import {
  EmbedLimits,
  PaginatedMessage, type PaginatedMessageAction,
  type PaginatedMessagePage, SelectMenuLimits,
} from '@sapphire/discord.js-utilities';
import {
  InteractionHandler,
  InteractionHandlerTypes,
  type None,
  type Option,
} from '@sapphire/framework';
import { noop } from '@sapphire/utilities';

import { and, eq } from 'drizzle-orm';
import { kil } from '@/db/Kil';
import { songProfileSources } from '@/db/schemas/song-profile-sources';

import { Icons } from '@/constants/icons';
import { EmbedButtons } from '@/constants/music/player-buttons';
import { playSong } from '@/features/music/play-song';
import type { ProfileWithPlaylists } from '@/music/resolvers/resolver';
import { spotifyProfileResolver } from '@/music/resolvers/spotify/spotify-profile-resolver';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { capitalizeFirst, sendPresetMessage } from '@/utils/utils';

@ApplyOptions<InteractionHandler.Options>({
  name: 'load-playlist',
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class LoadPlaylist extends InteractionHandler {
  public async run (interaction: ButtonInteraction) {
    const sources = await kil
      .select()
      .from(songProfileSources)
      .where(
        and(
          eq(songProfileSources.userId, interaction.user.id),
        ),
      );

    if (!sources.length) {
      await sendPresetMessage({
        interaction,
        preset: 'error',
        message: 'profile:profile_not_setup',
        ephemeral: true,
      });
      return;
    }

    const promises = await Promise.all(sources.map(async source => {
      if (source.source.toLowerCase() === 'spotify') {
        return spotifyProfileResolver.getPlaylists(source.sourceUrl);
      }

      return null;
    }));

    const profiles = promises.filter(Boolean).flat();

    if (!profiles.length) {
      await sendPresetMessage({
        interaction,
        message: 'commands:load-playlist.not_found',
        preset: 'error',
      });
      return;
    }

    const hasAnyTrack = profiles.filter(profile => profile.items.filter(s => s.tracks.total).length > 0);

    if (!hasAnyTrack) {
      await sendPresetMessage({
        interaction,
        message: 'Você não possui playlists com músicas.',
        preset: 'error',
      });

      return;
    }

    const paginatedMessage = new PaginatedMessage();

    profiles.forEach(profile => {
      const validPlaylists = profile.items.filter((s) => s.tracks.total);

      paginatedMessage.addPages(this.getPages(profile.source, validPlaylists, interaction.user));
      paginatedMessage.setActions(this.getActions({ ...profile, items: validPlaylists }));
    });

    const playlistsSum = profiles.reduce((acc, cur) => acc + cur.items.length, 0);

    if (playlistsSum > SelectMenuLimits.MaximumMaxValuesSize) {
      await sendPresetMessage({
        interaction,
        preset: 'error',
        message: 'commands:load-playlist.too_many_playlists',
        i18n: {
          max: SelectMenuLimits.MaximumMaxValuesSize,
        },
      });
    }

    await paginatedMessage.run(interaction, interaction.user);
  }

  public parse (buttonInteraction: ButtonInteraction): Option<None> {
    if (buttonInteraction.customId === EmbedButtons.LOAD_PLAYLIST) {
      return this.some();
    }

    return this.none();
  }

  private getPages (source: string, response: ProfileWithPlaylists['items'], user: User): PaginatedMessagePage[] {
    return response.map(
      (item) =>
        ({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${item.name}`.substring(0, EmbedLimits.MaximumTitleLength))
              .setAuthor({
                name: item.owner.name ?? 'No display',
                url: item.owner.href,
              })
              .setColor(Colors.Aqua)
              .setFooter({
                text: `${capitalizeFirst(source)} Playlist - ${item.tracks.total} músicas | https://twokei.com`,
              })
              .setThumbnail(item?.owner.images?.[0].url ?? user.displayAvatarURL() ?? null)
              .setImage(item?.images[0]?.url ?? null),
          ],
        } satisfies PaginatedMessagePage),
    );
  }

  private getActions (response: ProfileWithPlaylists): PaginatedMessageAction[] {
    return [
      {
        customId: 'play-select-menu',
        type: ComponentType.StringSelect,
        placeholder: 'Select a playlist',
        options: response.items.map((item, index) => ({
          label: item.name ?? 'No name',
          value: `${index}`,
          description: item.description.substring(0, 100) ?? '',
        })),
        run: async ({ interaction, handler }) =>
          interaction.isStringSelectMenu() &&
            (handler.index = parseInt(interaction.values[0], 10)),
      },
      {
        label: 'Previous',
        customId: 'previous',
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        run: ({ handler }) => {
          if (handler.index === 0) {
            handler.index = handler.pages.length - 1;
          } else {
            --handler.index;
          }
        },
      },
      {
        label: 'Select',
        customId: 'play',
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        run: async ({ collector, interaction: selectInteraction, handler }) => {
          const index = handler.index;

          const playlist = response.items?.[index];

          if (!playlist) {
            await selectInteraction.followUp('Playlist not found');
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
        label: 'Next',
        customId: 'next',
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        run: ({ handler }) => {
          if (handler.index === handler.pages.length - 1) {
            handler.index = 0;
          } else {
            ++handler.index;
          }
        },
      },
      {
        label: `${capitalizeFirst(response.source)}`,
        type: ComponentType.Button,
        url: response.href,
        style: ButtonStyle.Link,
        emoji: response.source === 'spotify' ? Icons.SpotifyLogo : Icons.DeezerLogo,
      },
    ];
  }
}
