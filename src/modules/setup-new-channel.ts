import {
  ChannelType,
  GuildChannel,
  GuildMember, GuildTextBasedChannel,
  PermissionFlagsBits, TextBasedChannel
} from 'discord.js';
import { canCreateChannels, canSendMessages } from '../utils/discord-utilities';
import { SongChannelEntity } from '../entities/SongChannelEntity';
import { Twokei } from '../app/Twokei';
import { createDefaultSongEmbed } from '../music/embed/create-song-embed';
import { getGuidLocale } from '../translation/guild-i18n';

export const setupNewChannel = async (channel: TextBasedChannel, member: GuildMember) => {
  const guild = member.guild;
  const self = guild.members.me;

  if (!member || !guild || !self) {
    throw new Error(`I can't setup the bot in this server, check if I have the correct permissions.`);
  }

  if (!canCreateChannels(guild)) {
    throw new Error(`I can't create channels in this server.`);
  }

  const currentChannel = await Twokei.dataSource.getRepository(SongChannelEntity)
    .findOne({
      where: {
        guild: guild.id
      }
    });

  if (currentChannel) {
    if (currentChannel.channel === channel.id) {
      throw new Error(`You can't use the command in this channel, please use another channel.`);
    }

    guild.channels.fetch(currentChannel.channel)
      .then(channel => {
        channel?.delete();
      })
      .catch(() => console.log('Failed to delete channel.'));
  }

  const newChannel = await guild.channels.create({
    name: 'song-requests',
    type: ChannelType.GuildText,
    permissionOverwrites: [{
      id: Twokei.user!.id,
      allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages]
    }]
  });

  if (!canSendMessages(newChannel)) {
    throw new Error(`I can't send messages in the new channel.`);
  }

  const locale = await getGuidLocale(guild.id);
  const embed = await createDefaultSongEmbed(locale);
  const newMessage = await newChannel.send({ embeds: [embed] });

  await Twokei.dataSource.getRepository(SongChannelEntity).upsert({
    guild: guild.id,
    channel: newChannel.id,
    message: newMessage.id
  }, ['guild']);

  return newChannel;
}