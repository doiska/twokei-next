import { Colors, EmbedBuilder, TextChannel } from 'discord.js';

const SongEmbedPlaceHolder = new EmbedBuilder()
  .setTitle(`No song playing`)
  .setDescription(`Use \`@Twokei <song>\` to play a song`)
  .setColor(Colors.DarkButNotBlack)
  .setAuthor({
    name: 'Created by doiská#0001 ⚡',
    url: 'https://twitter.com/two2kei'
  })
  .setImage('https://cdn.discordapp.com/attachments/1063635066762309772/1063635066762309772/unknown.png')
  .setFooter({
    text: 'Twokei',
  });

export const createEmbedIfNotExists = async (channel: TextChannel) => {

  const messages = await channel.messages.fetch({ limit: 1 });

  if(messages.size === 0) {
    return channel.send({ embeds: [SongEmbedPlaceHolder] });
  }
}