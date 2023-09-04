import type { ButtonInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import type { Option } from "@sapphire/framework";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import type { Awaitable } from "@sapphire/utilities";

import { SongProfileButtons } from "@/constants/music/player-buttons";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { Embed } from "@/utils/messages";
import { sendPresetMessage } from "@/lib/message-handler/helper";

@ApplyOptions<InteractionHandler.Options>({
  name: "song-profile-interactions",
  interactionHandlerType: InteractionHandlerTypes.Button,
  enabled: true,
})
export class SongProfileInteractionsHandler extends InteractionHandler {
  public async run(interaction: ButtonInteraction, target: string) {
    if (!target) {
      return;
    }

    await sendPresetMessage({
      interaction,
      preset: "loading",
      ephemeral: true,
    });

    try {
      await container.profiles.actions.toggleLike(interaction.user.id, target);
      await interaction.editReply({
        embeds: [Embed.success("All good!")],
      });
    } catch (e) {
      await sendPresetMessage({
        interaction,
        preset: "error",
        message: getReadableException(e),
        ephemeral: true,
      });
    }
  }

  public parse(
    buttonInteraction: ButtonInteraction,
  ): Awaitable<Option<string>> {
    if (
      !buttonInteraction.customId.startsWith(SongProfileButtons.LIKE_PROFILE) &&
      !buttonInteraction.customId.startsWith(SongProfileButtons.FOLLOW_PROFILE)
    ) {
      return this.none();
    }

    const targetId = buttonInteraction.customId.split("-")[1];

    return this.some(targetId);
  }
}
