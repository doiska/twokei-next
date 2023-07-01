import { t } from 'i18next';

import { getGuidLocale } from '@/modules/guild-locale';
import { logger } from '@/modules/logger-transport';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';

import { FriendlyException } from '../FriendlyException';
import { PlayerException } from '../PlayerException';

export const getReadableException = async (error: unknown, guildId: string) => {
  if (error instanceof FriendlyException || error instanceof PlayerException) {
    logger.debug('Handling readable exception', { error });

    const locale = await getGuidLocale(guildId);

    if (error.message) {
      return t(error.message, {
        ns: 'error',
        lng: locale ?? 'pt_br',
      });
    }

    return t(ErrorCodes.UNKNOWN, {
      ns: 'error',
      lng: locale ?? 'pt_br',
    });
  }

  logger.error(error);
  return 'An unexpected error occurred, please try again later.';
};
