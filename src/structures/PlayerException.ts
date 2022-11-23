import { logger } from "../utils/Logger";

export class PlayerException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PlayerException";

        logger.error(this);
    }
}