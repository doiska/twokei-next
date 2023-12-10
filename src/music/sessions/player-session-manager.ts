import { kil } from "@/db/Kil";
import { PlayerSession, playerSessions } from "@/db/schemas/player-sessions";
import { logger } from "@/lib/logger";
import { container } from "@sapphire/framework";

export async function restoreExpiredSessions(sessions: PlayerSession[]) {
  for (const session of sessions) {
    logger.debug(`Cleaning up session ${session.guildId}.`);
    const guild = await container.client.guilds.fetch(session.guildId);

    if (!guild) {
      continue;
    }

    logger.debug(`Cleaned session ${session.guildId}.`);
    await container.sc.reset(guild);
  }
}

export async function getSessions() {
  const allSessions = (await kil.select().from(playerSessions)) ?? [];

  const isExpired = (session: PlayerSession) => {
    const isQueueValid =
      session?.queue?.current || session?.queue?.queue?.length > 0;

    const isSessionExpired =
      !session.updatedAt || session.updatedAt.getTime() + 30000 < Date.now();

    return isSessionExpired || !isQueueValid;
  };

  const validSessions = allSessions.filter((session) => !isExpired(session));
  const expiredSessions = allSessions.filter((session) => isExpired(session));

  const dumpState = validSessions.map((session) => {
    const now = Date.now();
    const lastUpdate = session.state.timestamp;

    const duration = session.state.player.position ?? 0;

    const correction = now - lastUpdate + 5000;

    logger.debug(
      `Session ${session.guildId} was last updated ${lastUpdate}ms ago. Correcting by ${correction}ms.`,
    );

    session.state.player.position = duration + correction;
    return [session.guildId, session.state];
  });

  return {
    valid: validSessions,
    expired: expiredSessions,
    dump: dumpState,
  };
}
