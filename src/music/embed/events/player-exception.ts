import type { TrackExceptionEvent } from "shoukaku";

import type { Venti } from "@/music/controllers/Venti";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { sendPresetMessage } from "@/lib/message-handler/helper";

export async function handlePlayerException(
  venti: Venti,
  exception: TrackExceptionEvent,
) {
  if (!venti.embedMessage) {
    return;
  }

  await sendPresetMessage({
    interaction: venti.embedMessage,
    preset: "error",
    message: getReadableException(exception),
  });
}
