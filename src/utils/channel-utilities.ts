import { ChannelType, Guild, PermissionsBitField, TextChannel } from 'discord.js';
import { logger } from '../modules/logger-transport';
import { Maybe } from './type-guards';
import { isGuildBasedChannel, isTextBasedChannel, isTextChannel } from '@sapphire/discord.js-utilities';
import { canSendMessages } from './discord-utilities';

export const findAnyUsableChannel = async (guild: Guild): Promise<Maybe<TextChannel>> => {

  if (!guild.members.me) {
    return;
  }

  const channels = await guild.channels.fetch();

  const channel = channels.find(channel => {

    if (!channel) {
      return false;
    }

    if (!isGuildBasedChannel(channel) || !isTextChannel(channel)) {
      return false;
    }

    return canSendMessages(channel);
  });

  if (channel) {
    logger.debug(`Found channel ${channel.name} (${channel.id}) in guild ${guild.name} (${guild.id}).`);
  }

  return channel as Maybe<TextChannel>;
}