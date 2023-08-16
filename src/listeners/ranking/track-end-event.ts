import { ApplyOptions } from '@sapphire/decorators';
import { isVoiceBasedChannel } from '@sapphire/discord.js-utilities';
import { container, Listener } from '@sapphire/framework';

import { kil } from '@/db/Kil';
import { users } from '@/db/schemas/users';

import { logger } from '@/modules/logger-transport';
import type { Venti } from '@/music/controllers/Venti';
import { Events } from '@/music/interfaces/player.types';

@ApplyOptions<Listener.Options>({
  name: 'song-user-track-end',
  event: Events.TrackEnd,
  emitter: container.xiao,
  enabled: true,
})
export class TrackEndEvent extends Listener {
  public async run (venti: Venti) {
    const current = venti.queue.current;

    if (!current) {
      logger.info('Untrackable song');
      return;
    }

    const voiceChannelId = venti.voiceId;

    if (!voiceChannelId) {
      logger.debug('No VoiceChannelId found, skipping TrackEndEvent trackers.', { guild: venti.guildId });
      return;
    }

    const voiceChannel = await container.client.channels.fetch(voiceChannelId);

    if (!voiceChannel || !isVoiceBasedChannel(voiceChannel)) {
      logger.debug('No VoiceChannel found, skipping TrackEndEvent trackers.', { guild: venti.guildId });
      return;
    }

    const connected = voiceChannel.members.filter(member => !member.user.bot && !member.voice.selfDeaf);

    if (connected.size === 0) {
      logger.debug('No connected users found, skipping TrackEndEvent trackers.', { guild: venti.guildId });
      return;
    }

    await kil.transaction(async tx => {
      await tx.insert(users)
        .values(connected.map(member => ({
          id: member.id,
          name: member.user.username,
        })))
        .onConflictDoNothing();

      const track = {
        event: 'heard_song',
        source: 'Guild',
        properties: {
          guildId: venti.guildId,
          track: current.short(),
        },
      } as const;

      await container.analytics.track(connected.map(member => ({
        userId: member.id,
        ...track,
      })));
    });
  }
}
