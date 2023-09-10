import { logger } from "@/modules/logger-transport";
import { fetchApi } from "@/lib/api";

interface BaseProperties {
  users: string[];
  guild?: string;
  event: SongEvent["event"];
}

interface SongEvent {
  event: "liked_song" | "disliked_song" | "added_song" | "heard_song";
  track: {
    title?: string;
    author?: string;
    isrc?: string;
    uri: string;
    source: "spotify" | "deezer" | "youtube";
  };
}

type TrackableEvent = BaseProperties & SongEvent;

export class Analytics {
  public async track(event: TrackableEvent) {
    try {
      const response = await fetchApi("/analytics", {
        body: {
          event: event.event,
          users: [...new Set(event.users)],
          track: event.track,
        },
      });

      if (response.status === "error") {
        throw new Error(response.message);
      }
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`[Analytics] Could not track events: ${e.message}`, {
          event,
        });
      }
    }
  }
}
