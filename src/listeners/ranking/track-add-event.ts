import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { logger } from "@/modules/logger-transport";
import type { Venti } from "@/music/controllers/Venti";
import { Events } from "@/music/interfaces/player.types";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";

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

    await container.analytics.track({
      users: [user.id],
      guild: venti.guildId,
      event: "added_song",
      track: track.short(),
    });
  }
}
