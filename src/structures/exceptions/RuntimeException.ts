import {logger} from '../../modules/logger-transport';

export class RuntimeException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlayerException';

    logger.error(`[RuntimeException] ${message}`, {stack: this.stack});

  }
}