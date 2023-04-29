import { ChannelType, Guild, TextChannel } from 'discord.js';
import { isGuildBasedChannel, isStageChannel, isTextChannel } from '@sapphire/discord.js-utilities';

export const findAnyUsableChannel = async (guild: Guild) => {

  if (!guild.members.me) {
    return;
  }

  const self = guild.members.me;
  const systemChannel = guild.systemChannel;

  if(systemChannel && systemChannel.permissionsFor(self).has('SendMessages')) {
    return systemChannel as TextChannel;
  }

  const channels = await guild.channels.fetch();

  return channels.find(channel =>
      channel &&
      channel.permissionsFor(self).has('SendMessages') &&
      !isStageChannel(channel) &&
      isGuildBasedChannel(channel) &&
      isTextChannel(channel)
  ) as TextChannel;
}