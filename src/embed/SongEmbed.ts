import {
  APIEmbed,
  Colors,
  EmbedBuilder,
  Guild,
  TextChannel,
  userMention
} from 'discord.js';

export const songEmbedPlaceHolder = (guild: Guild) => new EmbedBuilder()
  .setTitle(`No song playing`)
  .setDescription(`Use \`@Twokei <song>\` to play a song`)
  .setColor(Colors.DarkButNotBlack)
  .setAuthor({
    name: 'Created by doiská#0001 ⚡',
    url: 'https://twitter.com/two2kei'
  })
  .setImage('https://media.tenor.com/XAS0z1xPCIcAAAAd/cyberpunk-vaporwave.gif')
  .setFooter({
    text: 'Twokei',
  });

export const createSongEmbed = (guild: Guild): APIEmbed => {

  const mention = guild.members.me ? userMention(guild.members.me.id) : 'Twokei';

  const description = [
    '',
    '**:shrug: How to use? It\'s easy!**',
    '',
    `- Easiest way: **${mention} <song>**.`,
    `- Or click here </play:1067082391975362654>.`,
    '- If you have **any questions**, click here </setup:1067082391975362656>.',
    '',
  ];

  return {
    description: description.join('\n'),
    color: Colors.DarkButNotBlack,
    author: {
      name: 'Created by doiská#0001 ⚡',
      url: 'https://twitter.com/two2kei'
    },
    image: {
      url: 'https://media.tenor.com/XAS0z1xPCIcAAAAd/cyberpunk-vaporwave.gif',
      height: 200,
      width: 200,
      proxy_url: 'https://media.tenor.com/XAS0z1xPCIcAAAAd/cyberpunk-vaporwave.gif',
    },
    footer: {
      text: 'Twokei'
    },
  }
}