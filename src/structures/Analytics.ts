import type { UserEvent } from '@/db/schemas/user-events';
import { kil } from '@/db/Kil';
import { userEvents } from '@/db/schemas/user-events';
import { logger } from '@/modules/logger-transport';

export class Analytics {
  public async track (userEvent: UserEvent | UserEvent[]) {
    await kil.insert(userEvents)
      .values(Array.isArray(userEvent) ? userEvent : [userEvent])
      .catch(err => {
        logger.error(err);
      });

    if (process.env.NODE_ENV !== 'production') {
      const events = [userEvent].flat()
        .map(event => event.event);
      logger.debug(`[ANALYTICS] Tracked ${events.length} events: ${events.join(', ')}`);
    }
  }
}
