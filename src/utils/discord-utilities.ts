import {
  BaseGuildVoiceChannel,
  Guild,
  GuildChannel, GuildMember,
  PermissionFlagsBits, PermissionResolvable,
  PermissionsBitField
} from 'discord.js';
import { ChannelTypes } from './utility-types';
import { isGuildMember, isGuildBasedChannel } from './discord-type-guards';

export const canCreateChannels = (guild: Guild) =>
  canDoGuildUtility(guild, [
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageMessages,
    PermissionsBitField.Flags.SendMessages
  ]);

export const canSendMessages = (channel: GuildChannel) =>
  canDoChannelUtility(channel, [PermissionsBitField.Flags.SendMessages]);

export const canJoinVoiceChannel = (channel: BaseGuildVoiceChannel) =>
  canDoChannelUtility(channel, [PermissionsBitField.Flags.Connect]);

function canDoGuildUtility(guild: Guild, permissions: PermissionResolvable) {
  const { me } = guild.members;

  if (!me) {
    return false;
  }

  return permissions
}

function canDoChannelUtility(channel: ChannelTypes, permissionsToPass: PermissionResolvable) {
  if (!isGuildBasedChannel(channel)) {
    return true;
  }

  const { me } = channel.guild.members;

  if (!me) {
    return false;
  }

  const permissionsFor = channel.permissionsFor(me);
  if (!permissionsFor) {
    return false;
  }

  return permissionsFor.has(permissionsToPass);
}