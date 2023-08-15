import type { ButtonInteraction, User } from 'discord.js';
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

import { and, eq } from 'drizzle-orm';
import { kil } from '@/db/Kil';
import { songProfileSources } from '@/db/schemas/song-profile-sources';

import { Icons } from '@/constants/icons';
import { EmbedButtons } from '@/constants/music/player-buttons';
import { playSong } from '@/features/music/play-song';
import type { ProfileWithPlaylists } from '@/music/resolvers/resolver';
import { spotifyProfileResolver } from '@/music/resolvers/spotify/spotify-profile-resolver';
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
        message: 'Parece que você não configurou seu perfil ainda, clique em **Ver perfil**',
        ephemeral: true,
      });
      return;
    }

    await sendPresetMessage({
      interaction,
      preset: 'loading',
      message: 'Carregando playlists...',
      ephemeral: true,
      deleteIn: 0,
    });

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
        message: 'Não encontramos nenhuma playlist pública em suas fontes.',
        preset: 'error',
      });
      return;
    }

    const paginatedMessage = new PaginatedMessage();

    profiles.forEach(profile => {
      const validPlaylists = profile.items.filter((s) => s.tracks.total);

      paginatedMessage.addPages(this.getPages(profile.source, validPlaylists, interaction.user));
      paginatedMessage.setActions(this.getActions(profile));
    });

    const playlistsSum = profiles.reduce((acc, cur) => acc + cur.items.length, 0);

    if (playlistsSum > SelectMenuLimits.MaximumMaxValuesSize) {
      await sendPresetMessage({
        interaction,
        preset: 'error',
        message: `Vocé possui mais de ${SelectMenuLimits.MaximumMaxValuesSize} playlists, por isso não podemos exibir todas no menu.`,
      });
    }

    await paginatedMessage.run(interaction);
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
              .setTitle(`${source} - ${item.name}`.substring(0, EmbedLimits.MaximumTitleLength))
              .setAuthor({
                name: item.owner.name ?? 'No display',
                url: item.owner.href ?? 'href',
              })
              .setColor(Colors.Aqua)
              .setFooter({
                text: `Playlist - ${item.tracks.total} musicas | Twokei`,
              })
              .setThumbnail(user.avatarURL({ size: 512 }))
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
        run: async ({ interaction, handler }) => {
          const index = handler.index;

          const playlist = response.items?.[index];

          if (!playlist) {
            await interaction.followUp('Playlist not found');
            return;
          }

          await interaction.deleteReply();
          await playSong(interaction, playlist.href);
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
