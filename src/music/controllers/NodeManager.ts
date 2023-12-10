import { z } from "zod";
import { kil } from "@/db/Kil";
import { coreSettings } from "@/db/schemas/core-settings";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export class NodeManager {
  public async getNodes() {
    const nodeSchema = z.object({
      name: z.string().default(() => `Node ${Math.random().toString(36)}`),
      url: z.string(),
      auth: z.string().optional().default(""),
      active: z.boolean().default(true),
      secure: z.boolean().default(false),
    });

    const [nodes] = await kil
      .select()
      .from(coreSettings)
      .where(eq(sql`lower(${coreSettings.name})`, "nodes"));

    if (!nodes) {
      logger.error("Failed to find usable nodes in database.");
      return [];
    }

    const parsedNodes = await z.array(nodeSchema).safeParseAsync(nodes.value);

    if (!parsedNodes.success) {
      logger.error(`Failed to parse nodes: ${parsedNodes.error}`, {
        parsedNodes,
      });
      return [];
    }

    return parsedNodes.data;
  }
}

export const nodeManager = new NodeManager();
