import { logger } from "@/lib/logger";
import { env } from "@/app/env";

export async function isUserPremium(userId: string) {
  logger.info(`${env.WEBSITE_URL}/api/user/${userId}`);

  const response = await fetch(`${env.WEBSITE_URL}/api/user/${userId}`, {
    headers: {
      Authorization: env.RESOLVER_KEY,
    },
  })
    .then((response) => response.json() as Promise<{ subscribed: boolean }>)
    .catch((e) => {
      logger.error(e);
      return null;
    });

  if (!response) {
    logger.error(`Failed to fetch user role for ${userId}`);
    return;
  }

  return response.subscribed;
}
