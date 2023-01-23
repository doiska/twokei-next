import { Guild } from 'discord.js';
import { isGuildMember } from './discord-type-guards';

export const findUsableAdminChannel = (guild: Guild) => {

  if(!guild.members.me) {
    return;
  }

  const self = guild.members.me;
  const systemChannel = guild.systemChannel;
  const widgetChannel = guild.widgetChannel;

  if (systemChannel) {
    return systemChannel;
  }

  if (widgetChannel) {
    return widgetChannel;
  }

  if (!isGuildMember(self)) {
    return;
  }

  return guild.channels.cache.find(channel => channel.permissionsFor(self).has('SendMessages'));
}