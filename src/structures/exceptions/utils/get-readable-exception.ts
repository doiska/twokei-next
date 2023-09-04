import { logger } from "@/modules/logger-transport";
import { ErrorCodes } from "@/structures/exceptions/ErrorCodes";
import { FriendlyException } from "../FriendlyException";
import { PlayerException } from "../PlayerException";
import { inspect } from "util";

export const getReadableException = (error: unknown) => {
  if (error instanceof FriendlyException || error instanceof PlayerException) {
    if (error.message) {
      return error.message;
    }

    return ErrorCodes.UNKNOWN;
  }

  logger.error("An unhandled exception occurred", {
    error: inspect(error),
  });

  return "An unexpected error occurred, please try again later.";
};
