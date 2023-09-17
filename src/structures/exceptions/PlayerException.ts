import { logger } from "@/lib/logger";

export class PlayerException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlayerException";

    logger.debug(`[PlayerException] ${message}`, { stack: this.stack });
  }
}
