import { createCommand } from 'twokei-framework';
import { Twokei } from '../app/Twokei';
import { GuildEntity } from '../entities/GuildEntity';
import { canCreateChannels, canSendMessages } from '../utils/discord-utilities';
import { ChannelType, PermissionFlagsBits, channelMention } from 'discord.js';
import {
  songEmbedPlaceHolder
} from '../embed/SongEmbed';
import { SongChannelEntity } from '../entities/SongChannelEntity';

export const setupCommand = createCommand({
  name: 'setup',
  description: 'Setup the bot.'
}, async (context) => {

  if (!context.guild) {
    return;
  }

  if (!canCreateChannels(context.guild)) {
    return `I can't create channels in this server.`;
  }

  const guild = await Twokei.dataSource.getRepository(GuildEntity)
    .upsert({
      id: context.guild.id
    }, {
      conflictPaths: ['id']
    });

  const currentChannel = await Twokei.dataSource.getRepository(SongChannelEntity)
    .findOne({
        where: {
          guild: guild.identifiers[0].id
        }
      }
    );

  if (currentChannel) {
    if (currentChannel.channel === context.channel?.id) {
      return `You can't setup the bot in this channel, please use another channel.`;
    }

    context.guild.channels.fetch(currentChannel.channel)
      .then((channel) => {
        channel?.delete();
      })
      .catch(() => {
        console.log('Failed to delete channel.');
      });
  }

  const channel = await context.guild.channels.create({
    name: 'song-requests',
    type: ChannelType.GuildText,
    permissionOverwrites: [{
      id: Twokei.user!.id,
      allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages]
    }]
  });

  if (!canSendMessages(channel)) {
    return `I can't send messages in this channel.`;
  }

  const message = await channel.send({ embeds: [songEmbedPlaceHolder(context.guild)] });

  const id = guild.identifiers[0].id;

  await Twokei.dataSource.getRepository(SongChannelEntity).upsert({
    guild: id,
    channel: channel.id,
    message: message.id
  }, ['guild']);

  return `Setup complete, now you can use ${channelMention(channel.id)} to request songs.`;
});