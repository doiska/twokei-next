import { logger } from "@/lib/logger";
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

interface Props {
  isrc?: string[];
  limit?: number;
}

export async function getRecommendations(userId: string, config?: Props) {
  const { isrc, limit } = config ?? {};

  const urlParams = new URLSearchParams({
    limit: limit?.toString() ?? "20",
    seeds: isrc?.join(",") ?? "",
  });

  try {
    return await fetchApi<Recommendation[]>(
      `/recommendations/${userId}?${urlParams.toString()}`,
    );
  } catch (error) {
    logger.error(error);
    throw new FriendlyException("Ocorreu um erro ao buscar as recomendações.");
  }
}
