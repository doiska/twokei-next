import { logger } from "@/modules/logger-transport";
import { env } from "@/app/env";
import { fetchApi } from "@/lib/api";

interface BaseProperties {
  userId: string;
  event: SongEvent["event"];
  guild?: string;
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
  public async track(userEvent: TrackableEvent | TrackableEvent[]) {
    const events = [userEvent].flat();

    const responses = await Promise.allSettled(
      events.map(async (event) => {
        return fetchApi(`/analytics/${event.userId}`, {
          body: event,
        });
      }),
    );

    const errors = responses.filter(
      (response) => response.status === "rejected",
    ) as PromiseRejectedResult[];

    if (errors.length > 0) {
      logger.error(
        `[ANALYTICS] Failed to track ${errors.length} events: ${errors
          .map((error) => error.reason)
          .join(", ")}`,
      );
    }

    if (env.NODE_ENV !== "production") {
      const events = [userEvent].flat().map((event) => event.event);

      logger.debug(
        `[ANALYTICS] Tracked ${events.length} events: ${events.join(", ")}`,
      );
    }
  }
}
