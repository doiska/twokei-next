import { ChannelType, Guild, GuildTextBasedChannel, TextChannel } from 'discord.js';
import { isGuildBasedChannel, isStageChannel, isTextChannel } from '@sapphire/discord.js-utilities';

export const finyAnyUsableChannel = async (guild: Guild) => {

  if (!guild.members.me) {
    return;
  }

  const self = guild.members.me;
  const systemChannel = guild.systemChannel;

  if (systemChannel) {
    return systemChannel;
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