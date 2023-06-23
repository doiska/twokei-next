import { ChannelType, Colors, EmbedBuilder, userMention } from 'discord.js';

import { eq } from 'drizzle-orm';
import { createEvent, MessageBuilder } from 'twokei-framework';

import { Twokei } from '../../app/Twokei';
import { kil } from '../../db/Kil';
import { songChannels } from '../../db/schemas/SongChannels';
import { logger } from '../../modules/logger-transport';
import { addNewSong } from '../../music/heizou/add-new-song';
import { PlayerException } from '../../structures/exceptions/PlayerException';


export const onMessage = createEvent('messageCreate', async (message) => {

  const selfId = Twokei.user?.id;

  if (!selfId || message.author.bot) {
    return;
  }

  if (!message.member || !message.guild?.id || message.channel.type !== ChannelType.GuildText) {
    return;
  }

  const [usableChannel] = await kil.select()
    .from(songChannels)
    .where(eq(songChannels.guildId, message.guild.id));

  const channel = message.channel;
  const contentOnly = message.content.replace(/<@!?\d+>/g, '').trim();
  const hasMention = message.mentions.users.has(selfId);
  const isUsableChannel = usableChannel?.channelId === channel.id;
  const hasContent = contentOnly.length > 0;


  if (!hasMention && !isUsableChannel) {
    return;
  }

  if (isUsableChannel) {
    await message.delete();
  }

  if (!hasMention && isUsableChannel) {
    const reply = [
      '**Due a `Discord` limitation, to use this channel you need to send a message mentioning the bot.**',
      'Please mention the bot and the song.',
      '',
      `**Example:** ${userMention(selfId)} https://music.youtube.com/watch?v=Ni5_Wrmh0f8`,
      'Or click here </play:1052294614503137374>.'
    ];

    const embed = new EmbedBuilder()
      .setTitle('🥲 Sorry!')
      .setDescription(reply.join('\n'));

    return new MessageBuilder()
      .setEmbeds(embed)
      .send(channel);
  }

  if (!hasContent) {
    return new MessageBuilder()
      .setContent('Please provide a song to play.')
      .send(channel);
  }

  try {
    const result = await addNewSong(contentOnly, message.member);

    const name = result.playlistName || result.tracks[0].title;
    const isPlaylist = !!result.playlistName;

    const embed = new EmbedBuilder()
      .setDescription(`${isPlaylist ? 'Playlist' : 'Track'}: **${name}** added to queue.`)
      .setColor(Colors.DarkButNotBlack);

    return new MessageBuilder()
      .setEmbeds([embed])
      .send(channel);
  } catch (e) {
    if (e instanceof PlayerException) {
      return new MessageBuilder()
        .setContent(e.message)
        .send(channel);
    }

    logger.error(e);

    return new MessageBuilder()
      .setContent('An error occurred while trying to play the song.')
      .send(channel);
  }
});