import type { TrackExceptionEvent } from "@twokei/shoukaku";

import type { Venti } from "@/music/controllers/Venti";
import { playerLogger } from "@/lib/logger";

export async function handlePlayerException(
  venti: Venti,
  exception: TrackExceptionEvent,
) {
  playerLogger.error(`Player Exception: ${exception.type}`, {
    guild: venti.guild.id,
    exception: exception.exception.message,
  });
}
