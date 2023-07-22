import { container, Listener } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Events } from '@/music/interfaces/player.types';
import type { Venti } from '@/music/controllers/Venti';
import { logger } from '@/modules/logger-transport';

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

    logger.info(`[SONG-USER-TRACKER] ${current?.title} was added to the queue by ${user.tag} (${user.id})`);

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
