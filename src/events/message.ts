import { createEvent } from 'twokei-framework';
import { Message } from 'discord.js';
import { Twokei } from '../app/Twokei';

export const onMessage = createEvent('messageCreate', async (client, message: Message) => {

  if(message.author.bot) {
    return;
  }

  const channelId = '1063635066762309772';

  if(message.channel.id !== channelId) {
    return;
  }

  if(!message.content) {
    await message.reply('Use `@Twokei <song>` to play a song');
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

  message.channel.send(`Added **${track.info.title}** ${rest.length > 1 ? `with other ${rest.length} songs to the queue` : ''}`);
})