import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { logger } from "@/lib/logger";
import type { Venti } from "@/music/controllers/Venti";
import { Events } from "@/music/interfaces/player.types";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";
import { trackEvent } from "@/lib/analytics/track-event";

@ApplyOptions<Listener.Options>({
  name: "song-user-tracker",
  event: Events.TrackStart,
  emitter: container.xiao,
  enabled: true,
})
export class TrackAddEvent extends Listener {
  public async run(venti: Venti, track: ResolvableTrack) {
    const user = track?.requester;

    if (!track || !user) {
      logger.info(
        `Cannot track (${track?.title}) by user: ${user?.tag} (${user?.id})`,
      );
      return;
    }

    if (
      venti.loop === "track" ||
      track?.title === venti.queue.previous?.title
    ) {
      return;
    }

    if (!track.isrc) {
      logger.error(
        `Cannot track (${track?.title}) by user: ${user?.tag} (${user?.id})`,
      );
      return;
    }

    await trackEvent({
      users: [user.id],
      guild: venti.guildId,
      event: "added_song",
      track: {
        isrc: track.isrc,
      },
    });
  }
}

void container.stores.loadPiece({
  name: "song-user-tracker",
  piece: TrackAddEvent,
  store: "listeners",
});
