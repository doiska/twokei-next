import { logger } from '@/modules/logger-transport';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { FriendlyException } from '../FriendlyException';
import { PlayerException } from '../PlayerException';

export const getReadableException = (error: unknown) => {
  if (error instanceof FriendlyException || error instanceof PlayerException) {
    logger.debug('Handling readable exception', { error });

    if (error.message) {
      return error.message;
    }

    return ErrorCodes.UNKNOWN;
  }

  logger.error('An unhandled exception occurred', { error });
  return 'An unexpected error occurred, please try again later.';
};
