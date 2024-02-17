import { z } from "zod";
import { logger } from "@/lib/logger";
import { env } from "@/app/env";

const schema = z.object({
  cached: z.boolean(),
  cache_expiry: z.number(),
  data: z.object({
    profile_theme: z.array(z.string()).nullable(),
  }),
});

export async function getExternalProfile(userId: string) {
  try {
    if (!env.EXTERNAL_PROFILE_ENDPOINT) {
      return;
    }

    const response = await fetch(
      `${env.EXTERNAL_PROFILE_ENDPOINT}${userId}`,
    ).then((res) => res.json());

    const result = schema.safeParse(response);

    if (!result.success) {
      return;
    }

    return result.data;
  } catch (error) {
    logger.error(error);
  }
}
