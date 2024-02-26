import { ApplyOptions } from "@sapphire/decorators";
import { isVoiceBasedChannel } from "@sapphire/discord.js-utilities";
import { container, Listener } from "@sapphire/framework";
import type { Track } from "@twokei/shoukaku";
import { logger } from "@/lib/logger";
import type { Venti } from "@/music/controllers/Venti";
import { Events } from "@/music/interfaces/player.types";
import { trackEvent } from "@/lib/analytics/track-event";

@ApplyOptions<Listener.Options>({
  name: "song-user-track-end",
  event: Events.TrackEnd,
  emitter: container.xiao,
  enabled: true,
})
export class TrackEndEvent extends Listener<typeof Events.TrackEnd> {
  public async run(venti: Venti, _?: Track, reason?: string) {
    const current = venti.queue.current;

    logger.debug(`[TrackEnd] Track ended: ${reason ?? "No reason"}`);

    if (reason && ["replaced", "error"].includes(reason.toLowerCase())) {
      return;
    }

    if (!current) {
      return;
    }

    if (!current.length || current.length < 10000) {
      return;
    }

    const voiceChannelId = venti.voiceId;

    if (!voiceChannelId) {
      return;
    }

    const voiceChannel = await container.client.channels.fetch(voiceChannelId);

    if (!voiceChannel || !isVoiceBasedChannel(voiceChannel)) {
      return;
    }

    const connected = voiceChannel.members.filter(
      (member) => !member.user.bot && !member.voice.selfDeaf,
    );

    if (connected.size === 0) {
      return;
    }

    if (!current.isrc) {
      logger.error(`Cannot track (${current?.title}), missing ISRC`);
      return;
    }

    await trackEvent({
      event: "heard_song",
      guild: venti.guildId,
      users: connected.map((member) => member.user),
      tracks: [current],
    });
  }
}

void container.stores.loadPiece({
  name: "song-user-track-end",
  piece: TrackEndEvent,
  store: "listeners",
});
