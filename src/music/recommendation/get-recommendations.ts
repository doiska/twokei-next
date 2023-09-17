import { fetchApi } from "@/lib/api";
import { logger } from "@/lib/logger";

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
    return {
      status: "error" as const,
      message: "Ocorreu um erro ao buscar as recomendações.",
    };
  }
}
