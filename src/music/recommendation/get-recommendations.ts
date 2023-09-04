import { logger } from "@/modules/logger-transport";
import { RateLimitManager } from "@sapphire/ratelimits";
import { FriendlyException } from "@/structures/exceptions/FriendlyException";
import { fetchApi } from "@/lib/api";

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

const limitInMillis =
  process.env.NODE_ENV === "production" ? 2 * 60 * 1000 : 1000;

const rateLimitManager = new RateLimitManager(limitInMillis);

export async function getRecommendations(userId: string, isrc?: string[]) {
  const seeds = isrc ? `?seeds=${encodeURI(isrc.join(","))}` : "";

  const rateLimit = rateLimitManager.acquire(userId);

  if (rateLimit.limited) {
    throw new FriendlyException(
      "Em espera, aguarde mais alguns segundos para usar novamente.",
    );
  }

  rateLimit.consume();

  try {
    return await fetchApi<Recommendation[]>(
      `/recommendations/${userId}${seeds}`,
    );
  } catch (error) {
    logger.error(error);
    throw new FriendlyException("Ocorreu um erro ao buscar as recomendações.");
  }
}
