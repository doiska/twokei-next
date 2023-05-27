import { logger } from '../../modules/logger-transport';

export class PlayerException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlayerException';

    logger.debug(`[PlayerException] ${message}`, { stack: this.stack });
  }
}