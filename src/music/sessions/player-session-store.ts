import { container } from "@sapphire/framework";
import { kil } from "@/db/Kil";
import { playerSessions } from "@/db/schemas/player-sessions";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const eventSchema = z.object({
  op: z.enum(["playerUpdate", "event"]),
  type: z.enum(["TrackStartEvent", "TrackEndEvent"]).optional(),
  guildId: z.string(),
});

export async function playerSessionStore(node: string, event: unknown) {
  const result = eventSchema.safeParse(event);

  if (!result.success) {
    return;
  }

  const playerEvent = result.data;

  if (container.xiao.shoukaku.reconnectingPlayers.has(playerEvent.guildId)) {
    return;
  }

  const dump = container.xiao.shoukaku.playersDump.get(playerEvent.guildId);

  if (!dump) {
    await kil
      .delete(playerSessions)
      .where(eq(playerSessions.guildId, playerEvent.guildId));
    return;
  }

  await kil
    .insert(playerSessions)
    .values({
      guildId: playerEvent.guildId,
      state: dump,
      queue: container.xiao.players.get(playerEvent.guildId)?.queue.dump(),
    })
    .onConflictDoUpdate({
      target: playerSessions.guildId,
      set: {
        state: dump,
        queue: container.xiao.players.get(playerEvent.guildId)?.queue.dump(),
        updatedAt: sql`NOW()`,
      },
    });
}
