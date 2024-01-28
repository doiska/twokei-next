import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import type { Venti } from "@/music/controllers/Venti";
import { Events } from "@/music/interfaces/player.types";
import { trackEvent } from "@/lib/analytics/track-event";
import { ResolvableTrack } from "@/music/structures/ResolvableTrack";

@ApplyOptions<Listener.Options>({
  name: "song-user-tracker",
  event: Events.TrackStart,
  emitter: container.xiao,
  enabled: true,
})
export class TrackStartEvent extends Listener {
  public async run(venti: Venti, result: ResolvableTrack) {
    if (venti.loop === "track") {
      return;
    }

    await trackEvent({
      users: result.requester ? [result.requester] : [],
      guild: venti.guildId,
      event: "added_song",
      tracks: [result],
    });
  }
}

void container.stores.loadPiece({
  name: "song-user-tracker",
  piece: TrackStartEvent,
  store: "listeners",
});
