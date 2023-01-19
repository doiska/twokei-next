import { createEvent } from 'twokei-framework';
import { Colors, EmbedBuilder, Message } from 'discord.js';
import { Twokei } from '../app/Twokei';

export const onMessage = createEvent('messageCreate', async (message: Message) => {

  if(message.author.bot) {
    return;
  }

  const channelId = '1063639091498991656';

  if(message.channel.id !== channelId) {
    return;
  }

  if(!message.content) {
    const reply = [
      `**Due a \`Discord\` limitation, to use this channel you need to send a message mentioning the bot.**`,
      `Please mention the bot and the song.`,
      '',
      `**Example:** <@${Twokei.user?.id}> https://music.youtube.com/watch?v=Ni5_Wrmh0f8`,
      `Or click here </play:1052294614503137374>.`
    ]

    const embed = new EmbedBuilder()
      .setTitle(`🥲 Sorry!`)
      .setDescription(reply.join('\n'))
      .setColor(Colors.DarkButNotBlack)

    await message.reply({ embeds: [embed] });
    return;
  }

  const contentOnly = message.content.replace(/<@!?\d+>/g, '').trim();

  if(!contentOnly) {
    return;
  }

  if(!message.guild?.id || !message.member?.voice.channel?.id) {
    return;
  }


  const result = await Twokei.xiao.search(contentOnly);

  if(!result.tracks.length) {
    return;
  }

  const player = await Twokei.xiao.createPlayer({
    guild: message.guild?.id,
    channel: message.member?.voice.channel?.id,
  });

  player.queue.add(...result.tracks);

  if(!player.playing) {
    player.play();
  }

  const [track, ...rest] = result.tracks;

  message.channel.send(`Added **${track.info.title}** ${rest.length >= 1 ? `with other ${rest.length} song(s)` : ''} to the queue.`);
})