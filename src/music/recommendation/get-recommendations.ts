import { logger } from "@/modules/logger-transport";
import { RateLimitManager } from "@sapphire/ratelimits";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";

interface Recommendation {
  id: string;
  name: string;
  artists: Array<{
    name: string;
    id: string;
  }>;
  isrc: string;
  href: string;
  external_url: string;
  duration_ms: number;
}

const rateLimitManager = new RateLimitManager(2 * 60 * 1000);

export async function getRecommendations(userId: string, isrc?: string[]) {
  const seeds = isrc ? `?seeds=${encodeURI(isrc.join(","))}` : "";

  const rateLimit = rateLimitManager.acquire(userId);

  if (rateLimit.limited) {
    throw new FriendlyException(
      "Em espera, aguarde mais alguns segundos para usar novamente.",
    );
  }

  rateLimit.consume();

  return await fetch(
    `${process.env.RESOLVER_URL}/recommendations/${userId}${seeds}`,
    {
      headers: {
        Authorization: process.env.RESOLVER_KEY!,
      },
    },
  )
    .then(async (r) => {
      if (r.status !== 200) {
        return [];
      }

      return (await r.json()) as unknown as Recommendation[];
    })
    .catch((e) => {
      logger.error(e);
    });
}
