import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';

import { eq } from 'drizzle-orm';
import { kil } from '@/db/Kil';
import { users } from '@/db/schemas/users';

import { logger } from '@/modules/logger-transport';
import type { Venti } from '@/music/controllers/Venti';
import { Events } from '@/music/interfaces/player.types';

@ApplyOptions<Listener.Options>({
  name: 'song-user-tracker',
  event: Events.TrackStart,
  emitter: container.xiao,
  enabled: true,
})
export class SongUserTracker extends Listener {
  public async run (venti: Venti) {
    const current = venti.queue.current;
    const user = current?.requester;

    if (!current || !user) {
      logger.info('Untrackable song');
      return;
    }

    logger.info(`[TRACKER] ${current?.title} was added to the queue by ${user.tag} (${user.id})`);

    await kil.insert(users)
      .values({
        id: user.id,
        name: user.username,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: user.username,
        },
        where: eq(users.id, user.id),
      });

    await container.analytics.track({
      userId: user.id,
      event: 'play_song',
      source: 'Guild',
      properties: {
        guildId: venti.guildId,
        track: current.short(),
      },
    });
  }
}
