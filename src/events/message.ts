import { createEvent } from 'twokei-framework';
import { ChannelType, Colors, EmbedBuilder, userMention } from 'discord.js';
import { Twokei } from '../app/Twokei';
import { play } from '../modules/heizou/play';
import { SongChannelEntity } from '../entities/SongChannelEntity';
import { PlayerException } from '../structures/PlayerException';
import { logger } from '../modules/Logger';

export const onMessage = createEvent('messageCreate', async (message) => {

  const selfId = Twokei.user?.id;

  if (!selfId || message.author.bot) {
    return;
  }

  if (!message.member || !message.guild?.id || message.channel.type !== ChannelType.GuildText) {
    return;
  }

  const usableChannel = await Twokei.dataSource
    .getRepository(SongChannelEntity)
    .findOne({
      where: {
        guild: message.guild.id
      }
    });

  const contentOnly = message.content.replace(/<@!?\d+>/g, '').trim();
  const hasMention = message.mentions.users.has(selfId);
  const hasContent = contentOnly.length > 0;
  const isUsableChannel = usableChannel?.channel === message.channel.id;

  if(!hasMention && !isUsableChannel) {
    return;
  }

  if(!hasMention && isUsableChannel) {
    const reply = [
      `**Due a \`Discord\` limitation, to use this channel you need to send a message mentioning the bot.**`,
      `Please mention the bot and the song.`,
      '',
      `**Example:** <@${userMention(selfId)}> https://music.youtube.com/watch?v=Ni5_Wrmh0f8`,
      `Or click here </play:1052294614503137374>.`
    ]

    const embed = new EmbedBuilder()
      .setTitle(`🥲`)
      .setDescription(reply.join('\n'))

    return message.reply({ embeds: [embed] });
  }

  if(!hasContent) {
    return message.reply('Please provide a song to play.');
  }

  try {
    const [track, ...rest] = await play(contentOnly, message.member)

    message.reply(`Added **${track.info.title}** ${rest.length >= 1 ? `with other ${rest.length} song(s)` : ''} to the queue.`);
  } catch (e) {
    if(e instanceof PlayerException) {
      return message.reply(e.message);
    }

    logger.error(e);
    message.reply(`An error occurred while trying to play the track.`);
  }
})