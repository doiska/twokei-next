import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, type User } from 'discord.js';

import { type TFunction } from 'twokei-i18next';
import { type SongProfileWithSources } from '@/db/schemas/song-source';

const Sources = {
  youtube: {
    name: 'YouTube',
    emoji: ':youtube_logo:1129098179288240139',
  },
  deezer: {
    name: 'Deezer',
    emoji: ':deezer_logo:1129098175467241492',
  },
  spotify: {
    name: 'Spotify',
    emoji: ':spotify_logo:1129098176968806440',
  },
};

export function createSongProfileEmbed (
  requester: User,
  target: User,
  t: TFunction,
  profile: SongProfileWithSources,
) {
  const sourcesWithEmojis = profile.sources.map((s) => {
    const source = Sources[s.source.toLowerCase() as keyof typeof Sources];
    return `[<${source.emoji ?? ''}> ${source.name ?? s.source}](${s.sourceUrl})`;
  });

  const isMyProfile = requester.id === target.id;

  const description = t('profile:embed.description', {
    tag: profile.displayName || target.tag,
    rank: 1,
    rankEmoji: '🔥',
    followers: 123456,
    joinArrays: '\n',
  });

  const profileEmbed = new EmbedBuilder()
    .setThumbnail(target.displayAvatarURL())
    .setColor(Colors.Gold)
    .setDescription(description)
    .setFields([
      {
        name: 'Connected profiles',
        value: sourcesWithEmojis.join('\n'),
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: true,
      },
      {
        name: 'Favorites',
        value: [
          '⭐ Song: [No Grey](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
          '💿 Album: [Hurry!](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
          '🎨 Artist: [Birocratic](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
        ].join('\n'),
        inline: true,
      },
    ]);

  const buttons = [];

  if (isMyProfile) {
    buttons.push(new ButtonBuilder()
      .setLabel('Edit profile')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('edit-profile'));
  } else {
    buttons.push(new ButtonBuilder()
      .setLabel(`Like ${target.username}!`)
      .setStyle(ButtonStyle.Primary)
      .setCustomId('view-profile'));
  }

  buttons.push(
    new ButtonBuilder()
      .setLabel('View playlists')
      .setStyle(ButtonStyle.Secondary)
      .setCustomId('view-playlists'),
    new ButtonBuilder()
      .setLabel('View albums')
      .setStyle(ButtonStyle.Secondary)
      .setCustomId('view-albums'),
  );

  const row = new ActionRowBuilder<ButtonBuilder>({ components: buttons });

  return {
    embeds: [profileEmbed],
    components: [row],
  };
}
