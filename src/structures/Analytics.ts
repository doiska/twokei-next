import { kil } from '@/db/Kil';
import type { UserEvent } from '@/db/schemas/song-user-events';
import { songUserEvents } from '@/db/schemas/song-user-events';

import { logger } from '@/modules/logger-transport';

export class Analytics {
  public async track (userEvent: UserEvent | UserEvent[]) {
    await kil.insert(songUserEvents)
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
