import {
  ActionRowBuilder,
  ButtonBuilder, type ButtonInteraction,
  ButtonStyle, ComponentType,
  EmbedBuilder,
  type GuildMember,
  type Message,
} from 'discord.js';

import { OnPlayButtons } from '@/constants/music/player-buttons';
import type { XiaoSearchResult } from '@/music/interfaces/player.types';
import { Embed } from '@/utils/messages';
import { sendPresetMessage } from '@/utils/utils';

import { fetchT } from 'twokei-i18next';

export const createPlayEmbed = async (member: GuildMember, result: XiaoSearchResult) => {
  const t = await fetchT(member.user);
  const [track] = result.tracks;

  const capitalizedSource = track.sourceName
    .charAt(0)
    .toUpperCase() + track.sourceName.slice(1);

  const [
    like,
    dislike,
    viewSource,
  ] = ['like', 'dislike', 'view_source'].map((button) => t(`player:play.buttons.${button}`, { source: capitalizedSource }));

  const likeButton = new ButtonBuilder()
    .setCustomId(OnPlayButtons.LIKE)
    .setLabel(like)
    .setStyle(ButtonStyle.Primary);

  const dislikeButton = new ButtonBuilder()
    .setCustomId(OnPlayButtons.DISLIKE)
    .setLabel(dislike)
    .setStyle(ButtonStyle.Danger);

  const viewOnSource = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel(viewSource)
    .setURL(track.uri);

  const feedbackRow = new ActionRowBuilder<ButtonBuilder>({
    components: [
      likeButton,
      dislikeButton,
      viewOnSource,
    ],
  });

  const resultType = ['PLAYLIST_LOADED'].includes(result.type) ? 'playlist' : 'track';

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
    .setThumbnail(track.thumbnail ?? null);

  const responseEmbed = Embed.success(embed.data);

  return {
    embeds: [responseEmbed],
    components: [feedbackRow],
  };
};

export async function waitFeedback (message: Message) {
  const collector = message.createMessageComponentCollector({
    filter: (i: ButtonInteraction) => [OnPlayButtons.LIKE, OnPlayButtons.DISLIKE].includes(i.customId),
    componentType: ComponentType.Button,
    time: 60000,
  });

  collector.on('collect', async (i: ButtonInteraction) => {
    await sendPresetMessage({
      interaction: i,
      preset: 'success',
      message: 'player:play.feedback',
      ephemeral: true,
    });
  });

  return collector;
}
