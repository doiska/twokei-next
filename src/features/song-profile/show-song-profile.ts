import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, type User } from 'discord.js';
import { container } from '@sapphire/framework';

import { SongProfileButtons } from '@/constants/music/player-buttons';

import { match } from 'ts-pattern';
import { fetchT } from 'twokei-i18next';

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
    return `<${source.emoji ?? ''}> [${source.name ?? s.source}](https://open.spotify.com/user/${s.sourceUrl})`;
  }) ?? [];

  const targetName = profile.name ?? target.username;
  const isMyProfile = requester.id === target.id;

  const rankingEmoji = match(Number(profile?.ranking?.position))
    .with(1, () => ':first_place:')
    .with(2, () => ':second_place:')
    .with(3, () => ':third_place:')
    .otherwise(() => '-');

  const hasRanking = !!profile.ranking?.position;

  const title = t(`profile:embed.title_${hasRanking ? 'ranked' : 'unranked'}`,
    {
      tag: profile?.name ?? target.tag,
      rank: {
        emoji: rankingEmoji,
        position: profile?.ranking?.position,
      },
    });

  const description = t('profile:embed.description', {
    listened: profile?.ranking?.listened ?? 0,
    followers: profile.analytics.followers,
    joinArrays: '\n',
  });

  const isPremium = !!profile?.role;

  const profileEmbed = new EmbedBuilder()
    .setThumbnail(target.displayAvatarURL())
    .setColor(Colors.Gold)
    .setDescription([
      isPremium && t('profile:embed.premium'),
      title,
      description,
    ].filter(Boolean)
      .join('\n'))
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
      // TODO: Favorites?
      // {
      //   name: 'Favorites',
      //   value: [
      //     '⭐ Song: [No Grey](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
      //     '💿 Album: [Hurry!](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
      //     '🎨 Artist: [Birocratic](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
      //   ].join('\n'),
      //   inline: true,
      // },
    ]);

  const buttons = [];

  if (isMyProfile) {
    buttons.push(new ButtonBuilder()
      .setLabel('Edit profile')
      .setStyle(ButtonStyle.Primary)
      .setCustomId(SongProfileButtons.EDIT_PROFILE));
  } else {
    const isLiked = await container.profiles.actions.isLiked(requester.id, target.id);

    buttons.push(new ButtonBuilder()
      .setLabel(`${isLiked ? 'Unfollow' : 'Follow'} ${targetName}!`)
      .setStyle(isLiked ? ButtonStyle.Danger : ButtonStyle.Success)
      .setCustomId(`${SongProfileButtons.LIKE_PROFILE}-${target.id}`));
  }

  buttons.push(
    new ButtonBuilder()
      .setLabel('(Soon) View playlists')
      .setStyle(ButtonStyle.Secondary)
      .setCustomId('view-playlists')
      .setDisabled(true),
  );

  const row = new ActionRowBuilder<ButtonBuilder>({ components: buttons });

  return {
    embeds: [profileEmbed],
    components: [row],
    ephemeral: true,
  };
}
