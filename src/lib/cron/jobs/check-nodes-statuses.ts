import { container } from "@sapphire/framework";
import { logger } from "@/lib/logger";
import { groupBy } from "@/utils/helpers";
import { kil } from "@/db/Kil";
import { coreNodes } from "@/db/schemas/core-nodes";
import { inArray } from "drizzle-orm";

export async function execute() {
  const entries = Array.from(container.xiao.shoukaku.nodes.values());

  if (entries.length === 0) {
    logger.warn("No nodes found!");
    return;
  }

  const result = groupBy(entries, (node) => node.state);

  for (const [state, nodes] of Object.entries(result)) {
    logger.info(`Found ${nodes.length} nodes in state ${state}.`);

    await kil
      .update(coreNodes)
      .set({ currentStatus: state })
      .where(
        inArray(
          coreNodes.name,
          nodes.map((node) => node.name),
        ),
      );
  }
}
