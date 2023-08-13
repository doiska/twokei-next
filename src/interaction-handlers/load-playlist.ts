import type { ButtonInteraction } from 'discord.js';
import { ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import {
  PaginatedMessage,
  type PaginatedMessagePage,
} from '@sapphire/discord.js-utilities';
import {
  InteractionHandler,
  InteractionHandlerTypes, type None, type Option,
} from '@sapphire/framework';

import { and, eq } from 'drizzle-orm';
import { kil } from '@/db/Kil';
import { songProfileSources } from '@/db/schemas/song-profile-sources';

import { EmbedButtons } from '@/constants/music/player-buttons';
import { playSong } from '@/features/music/play-song';
import { spotifyProfileResolver } from '@/music/resolvers/spotify/spotify-profile-resolver';
import { sendPresetMessage } from '@/utils/utils';

@ApplyOptions<InteractionHandler.Options>({
  name: 'load-playlist',
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class LoadPlaylist extends InteractionHandler {
  public async run (interaction: ButtonInteraction) {
    const [profile] = await kil.select().from(songProfileSources)
      .where(
        and(
          eq(songProfileSources.userId, interaction.user.id),
          eq(songProfileSources.source, 'Spotify'),
        ),
      )
      .limit(1);

    if (!profile) {
      await sendPresetMessage({
        interaction,
        preset: 'error',
        message: 'Parece que você não configurou seu perfil ainda, clique em **Ver perfil**',
      });
      return;
    }

    const response = await spotifyProfileResolver.getPlaylists(profile.sourceUrl);

    const paginatedMessage = new PaginatedMessage();

    paginatedMessage.addPages(response.items.map(item => ({
      embeds: [
        new EmbedBuilder()
          .setTitle(item.name ?? 'No name')
          .setDescription([
            item.description,
            `Tracks: ${item.tracks?.total ?? 0}`,
            `Followers: ${item.followers?.total ?? 0}`,
          ].join('\n'))
          .setAuthor({
            name: item.owner.display_name ?? 'No display',
            url: item.owner.href ?? 'href',
          })
          .setThumbnail(interaction.user.avatarURL({ size: 512 }))
          .setImage(item?.images[0]?.url ?? null),
      ],
    }) satisfies PaginatedMessagePage));

    paginatedMessage.setActions([
      {
        customId: 'play-select-menu',
        type: ComponentType.StringSelect,
        placeholder: 'Select a playlist',
        options: response.items.map((item, index) => ({
          label: item.name ?? 'No name',
          value: item.uri ?? 'No id',
          description: item.description.substring(0, 100) ?? 'No description',
          default: index === 0,
        })),
        run: async ({ interaction }) => {
          if (!interaction.isStringSelectMenu()) {
            return;
          }

          await playSong(interaction, interaction.values[0]);
        },
      },
      {
        label: 'Spotify',
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        url: response.href,
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
            await interaction.reply('Playlist not found');
            return;
          }

          await playSong(interaction, playlist.uri);
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
    ]);

    await paginatedMessage.run(interaction);
  }

  public parse (buttonInteraction: ButtonInteraction): Option<None> {
    if (buttonInteraction.customId === EmbedButtons.LOAD_PLAYLIST) {
      return this.some();
    }

    return this.none();
  }
}
