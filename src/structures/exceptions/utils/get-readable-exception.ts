import { logger } from "@/lib/logger";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { FriendlyException } from "../FriendlyException";
import { PlayerException } from "../PlayerException";

export const getReadableException = (error: unknown) => {
  if (error instanceof FriendlyException || error instanceof PlayerException) {
    if (error.message) {
      return error.message;
    }

    return ErrorCodes.UNKNOWN;
  }

  logger.error(error);

  return "An unexpected error occurred, please try again later.";
};
