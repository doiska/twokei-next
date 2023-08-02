import { type Guild, type TextChannel } from 'discord.js';
import {
  canSendMessages,
  isGuildBasedChannel,
  isTextChannel,
} from '@sapphire/discord.js-utilities';

import { type Maybe } from '@/utils/utils';
import { logger } from '../modules/logger-transport';

export const findAnyUsableChannel = async (
  guild: Guild,
): Promise<Maybe<TextChannel>> => {
  if (!guild.members.me) {
    return null;
  }

  const channels = await guild.channels.fetch();

  const found = channels.find((channel) => {
    if (!channel) {
      return false;
    }

    if (!isGuildBasedChannel(channel) || !isTextChannel(channel)) {
      return false;
    }

    return canSendMessages(channel);
  });

  if (found) {
    logger.debug(
      `Found channel ${found.name} (${found.id}) in guild ${guild.name} (${guild.id}).`,
    );
  }

  return found as Maybe<TextChannel>;
};
