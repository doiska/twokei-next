import { ChannelType, Guild, GuildTextBasedChannel } from 'discord.js';

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
    channel.type === ChannelType.GuildText &&
    channel.isTextBased() &&
    channel.permissionsFor(self).has('SendMessages')
  ) as GuildTextBasedChannel
}