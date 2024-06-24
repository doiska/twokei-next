import { kil } from "@/db/Kil";
import { PlayerSession, playerSessions } from "@/db/schemas/player-sessions";
import { logger } from "@/lib/logger";
import { container } from "@sapphire/framework";

export async function restoreExpiredSessions(sessions: PlayerSession[]) {
  for (const session of sessions) {
    try {
      logger.debug(`Cleaning up session ${session.guildId}.`);
      const guild = await container.client.guilds.fetch(session.guildId);

      if (!guild) {
        continue;
      }

      logger.debug(`Cleaned session ${session.guildId}.`);
      await container.sc.reset(guild);
    } catch (e) {
      logger.error(`Failed to clean up session ${session.guildId}.`, e);
    }
  }
}

export async function getSessions() {
  const allSessions = await kil.select().from(playerSessions);

  const isExpired = (session: PlayerSession) => {
    const isQueueValid =
      session?.queue?.current || session?.queue?.queue?.length > 0;

    const isSessionExpired =
      !session.updatedAt || session.updatedAt.getTime() + 30000 < Date.now();

    return isSessionExpired || !isQueueValid;
  };

  const dumpState = [];
  const validSessions = [];
  const expiredSessions = [];

  for (const session of allSessions) {
    if (isExpired(session)) {
      expiredSessions.push(session);
      continue;
    }

    validSessions.push(session);
    dumpState.push([session.guildId, session.state]);
  }

  return {
    valid: validSessions,
    expired: expiredSessions,
    dump: dumpState,
  };
}
