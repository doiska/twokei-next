import { logger } from '../modules/logger-transport';

export class FriendlyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FriendlyException';

    logger.debug(`[FriendlyException] ${message}`, { stack: this.stack });
  }
}