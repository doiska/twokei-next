import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type GuildMember } from 'discord.js';

import type { XiaoSearchResult } from '@/music/interfaces/player.types';
import { Embed } from '@/utils/messages';

import { fetchT } from 'twokei-i18next';

export const createPlayEmbed = async (member: GuildMember, result: XiaoSearchResult) => {
  const t = await fetchT(member.user);
  const [track] = result.tracks;

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

  console.log(result.type);

  const resultType = ['TRACK_LOADED', 'SEARCH_RESULT'].includes(result.type) ? 'track' : 'playlist';

  const embed = new EmbedBuilder()
    .setAuthor(t('player:play.embed.author', {
      returnObjects: true,
      member: {
        name: member.user.tag,
        avatarUrl: member.user.displayAvatarURL(),
      },
    }))
    .setDescription(t(`player:play.embed.description_${resultType}`, {
      track: {
        title: track.title,
        author: track.author,
        uri: track.uri,
        thumbnail: track.thumbnail ?? '',
      },
      playlist: {
        name: result.type === 'PLAYLIST_LOADED' ? result.playlist.name : 'Playlist',
        amount: result.tracks.length,
      },
    }))
    .setThumbnail(track.thumbnail ?? '');

  const responseEmbed = Embed.success(embed.data);

  return {
    embeds: [responseEmbed],
    components: [row],
  };
};
