import {ChannelTypes, isDMChannel, isGuildBasedChannel} from '@sapphire/discord.js-utilities';
import {BaseGuildVoiceChannel, Guild, PermissionFlagsBits, PermissionResolvable, PermissionsBitField} from 'discord.js';


import {isNullish, Nullish} from './type-guards';

export const canCreateChannels = (guild: Guild) =>
  canDoGuildUtility(guild, [
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageMessages,
    PermissionsBitField.Flags.SendMessages
  ]);

const canReadMessagesPermissions = new PermissionsBitField([PermissionFlagsBits.ViewChannel]);
const canSendMessagesPermissions = new PermissionsBitField([canReadMessagesPermissions, PermissionFlagsBits.SendMessages]);

export function canSendMessages(channel: ChannelTypes | Nullish): boolean {
  if (isNullish(channel)) return false;
  if (isDMChannel(channel)) return true;
  if (channel.isThread() && !channel.sendable) return false;

  return canDoChannelUtility(channel, canSendMessagesPermissions);
}

export const canJoinVoiceChannel = (channel: BaseGuildVoiceChannel) =>
  canDoChannelUtility(channel, [PermissionsBitField.Flags.Connect]);

function canDoGuildUtility(guild: Guild, permissions: PermissionResolvable) {
  const {me} = guild.members;

  if (!me) {
    return false;
  }

  return permissions;
}

function canDoChannelUtility(channel: ChannelTypes, permissionsToPass: PermissionResolvable) {
  if (!isGuildBasedChannel(channel)) {
    return true;
  }

  const {me} = channel.guild.members;

  if (!me) {
    return false;
  }

  const permissionsFor = channel.permissionsFor(me);

  if (!permissionsFor) {
    return false;
  }

  return permissionsFor.has(permissionsToPass);
}
