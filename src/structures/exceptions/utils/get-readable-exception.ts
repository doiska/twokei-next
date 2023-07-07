import { Guild } from 'discord.js';

import { fetchT } from 'twokei-i18next';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { logger } from '@/modules/logger-transport';

import { PlayerException } from '../PlayerException';
import { FriendlyException } from '../FriendlyException';

export const getReadableException = async (error: unknown, guild?: Guild | null) => {
  if (error instanceof FriendlyException || error instanceof PlayerException) {
    logger.debug('Handling readable exception', { error });

    const t = guild ? await fetchT(guild) : (key: string) => key;

    if (error.message) {
      return t(error.message, {
        ns: 'error',
        defaultValue: ErrorCodes.UNKNOWN,
      });
    }

    return t(ErrorCodes.UNKNOWN, {
      ns: 'error',
    });
  }

  logger.error(error);
  return 'An unexpected error occurred, please try again later.';
};
