import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, type User } from 'discord.js';

import { fetchT } from 'twokei-i18next';
import { container } from '@sapphire/framework';
import { match } from 'ts-pattern';
import { SongProfileButtons } from '@/constants/music/player-buttons';

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

export async function createSongProfileEmbed (
  requester: User,
  target: User,
) {
  const t = await fetchT(requester);
  const profile = await container.profiles.get(target);

  const sourcesWithEmojis = profile?.sources.map((s) => {
    const source = Sources[s.source.toLowerCase() as keyof typeof Sources];
    return `[<${source.emoji ?? ''}> ${source.name ?? s.source}](${s.sourceUrl})`;
  }) ?? [];

  const targetName = profile?.displayName ?? target.tag;
  const isMyProfile = requester.id === target.id;

  const rankingEmoji = match(Number(profile?.ranking?.position))
    .with(1, () => ':first_place:')
    .with(2, () => ':second_place:')
    .with(3, () => ':third_place:')
    .otherwise(() => '-');

  const hasRanking = !!profile.ranking?.position;

  // TODO: add premium
  const premium = t('profile:embed.premium');

  const title = t(`profile:embed.title_${hasRanking ? 'ranked' : 'unranked'}`,
    {
      tag: profile?.displayName ?? target.tag,
      rank: {
        emoji: rankingEmoji,
        position: profile?.ranking?.position,
      },
    });

  const description = t('profile:embed.description', {
    likes: profile?.ranking?.likes ?? 0,
    listened: profile.analytics.listenedSongs,
    joinArrays: '\n',
  });

  const profileEmbed = new EmbedBuilder()
    .setThumbnail(target.displayAvatarURL())
    .setColor(Colors.Gold)
    .setDescription([
      premium,
      title,
      description,
    ].join('\n'))
    .setFields([
      {
        name: 'Connected profiles',
        value: sourcesWithEmojis.length ? sourcesWithEmojis.join('\n') : 'None yet :(',
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
    const isLiked = await container.profiles.actions.isLiked(requester.id, target.id);

    buttons.push(new ButtonBuilder()
      .setLabel(`${isLiked ? 'Unlike' : 'Like'} ${targetName}!`)
      .setStyle(isLiked ? ButtonStyle.Danger : ButtonStyle.Success)
      .setCustomId(`${SongProfileButtons.LIKE_PROFILE}-${target.id}`));
  }

  buttons.push(
    new ButtonBuilder()
      .setLabel('(Soon) View playlists')
      .setStyle(ButtonStyle.Secondary)
      .setCustomId('view-playlists')
      .setDisabled(true),
    new ButtonBuilder()
      .setLabel('(Soon) View albums')
      .setStyle(ButtonStyle.Secondary)
      .setCustomId('view-albums')
      .setDisabled(true),
  );

  const row = new ActionRowBuilder<ButtonBuilder>({ components: buttons });

  return {
    embeds: [profileEmbed],
    components: [row],
  };
}
