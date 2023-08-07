import { ActionRowBuilder, type APIEmbed, ButtonBuilder, ButtonStyle, type GuildMember } from 'discord.js';

import type { XiaoSearchResult } from '@/music/interfaces/player.types';
import { Embed } from '@/utils/messages';

import { type TFunction } from 'twokei-i18next';

export const createPlayEmbed = (t: TFunction, member: GuildMember, result: XiaoSearchResult) => {
  const [track, ...rest] = result.tracks;

  const capitalizedSource = track.sourceName
    .charAt(0)
    .toUpperCase() + track.sourceName.slice(1);

  const [like,
    dislike,
    viewSource,
  ] = ['like', 'dislike', 'view_source'].map((button) => t(`player:play.buttons.${button}`, { source: capitalizedSource }));

  const likeButton = new ButtonBuilder()
    .setCustomId('like')
    .setLabel(like)
    .setStyle(ButtonStyle.Primary);

  const dislikeButton = new ButtonBuilder()
    .setCustomId('dislike')
    .setLabel(dislike)
    .setStyle(ButtonStyle.Danger);

  const viewOnSource = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel(viewSource)
    .setURL(track.uri);

  const row = new ActionRowBuilder<ButtonBuilder>({
    components: [
      likeButton,
      dislikeButton,
      viewOnSource,
    ],
  });

  const embedTranslation = t('player:play.embed', {
    track: {
      title: track.title,
      author: track.author,
      uri: track.uri,
      thumbnail: track.thumbnail ?? '',
    },
    member: {
      name: member.user.tag,
      avatarUrl: member.user.displayAvatarURL(),
    },
    queue: {
      length: rest.length,
    },
    returnObjects: true,
  }) satisfies APIEmbed;

  const responseEmbed = Embed.success(embedTranslation);

  return {
    embeds: [responseEmbed],
    components: [row],
  };
};
