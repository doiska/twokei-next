import type { TrackExceptionEvent } from "@twokei/shoukaku";

import type { Venti } from "@/music/controllers/Venti";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { send } from "@/lib/message-handler";
import { Embed } from "@/utils/messages";
import { resolveKey } from "@sapphire/plugin-i18next";

export async function handlePlayerException(
  venti: Venti,
  exception: TrackExceptionEvent,
) {
  if (!venti.embedMessage || !venti.embedMessage.guild) {
    return;
  }

  await send(venti.embedMessage, {
    embeds: Embed.error(
      await resolveKey(
        venti.embedMessage.guild,
        getReadableException(exception),
      ),
    ),
  });
}
