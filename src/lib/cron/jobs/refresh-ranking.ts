import { kil } from "@/db/Kil";
import { listeningRanking } from "@/db/schemas/analytics-track-info";
import { logger } from "@/lib/logger";

export async function execute() {
  await kil.refreshMaterializedView(listeningRanking);
  logger.info("[Cron] Ranking refreshed");
}
