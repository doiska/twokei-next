import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { logger } from "@/modules/logger-transport";
import type { Venti } from "@/music/controllers/Venti";
import { Events } from "@/music/interfaces/player.types";

@ApplyOptions<Listener.Options>({
  name: "song-user-tracker",
  event: Events.TrackStart,
  emitter: container.xiao,
  enabled: true,
})
export class TrackAddEvent extends Listener {
  public async run(venti: Venti) {
    const current = venti.queue.current;
    const user = current?.requester;

    if (!current || !user) {
      logger.info("Untrackable song");
      return;
    }

    if (venti.loop === "track") {
      return;
    }

    if (venti.queue.current?.title === venti.queue.previous?.title) {
      return;
    }

    logger.info(
      `[TRACKER] ${current?.title} was added to the queue by ${user.tag} (${user.id})`,
    );

    await container.analytics.track({
      users: [user.id],
      guild: venti.guildId,
      event: "added_song",
      track: current.short(),
    });
  }
}
