import { type Guild } from 'discord.js';

import { logger } from '@/modules/logger-transport';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { FriendlyException } from '../FriendlyException';
import { PlayerException } from '../PlayerException';

import { fetchT } from 'twokei-i18next';

export const getReadableException = async (error: unknown, guild?: Guild | null) => {
  if (error instanceof FriendlyException || error instanceof PlayerException) {
    logger.debug('Handling readable exception', { error });

    const t = guild ? await fetchT(guild) : (key: string) => key;

    if (error.message) {
      return t(error.message, {
        ns: 'error',
      }) ?? 'An unexpected error occurred, please try again later.';
    }

    return t(ErrorCodes.UNKNOWN, {
      ns: 'error',
    }) ?? 'An unexpected error occurred, please try again later.';
  }

  logger.error(error);
  return 'An unexpected error occurred, please try again later.';
};
