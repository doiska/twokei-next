import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { AttachmentBuilder, ButtonInteraction } from "discord.js";
import { isValidCustomId } from "@/utils/helpers";
import { EmbedButtons } from "@/constants/buttons";
import { logger } from "@/lib/logger";
import { profileImage } from "discord-arts";
import { createProfile } from "@/canvas/profile/base";

@ApplyOptions<InteractionHandler.Options>({
  name: "profile-button",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
class ProfileButtonInteraction extends InteractionHandler {
  public parse(buttonInteraction: ButtonInteraction) {
    logger.debug("buttonInteraction.customId", buttonInteraction.customId);

    return isValidCustomId(
      buttonInteraction.customId,
      EmbedButtons.VIEW_PROFILE,
    );
  }

  public async run(interaction: ButtonInteraction) {
    await interaction.deferReply({
      ephemeral: true,
      fetchReply: true,
    });

    const user = await interaction.user.fetch(true);

    const rankCard = await createProfile({
      background: {
        url:
          user.bannerURL({
            forceStatic: true,
            extension: "png",
            size: 1024,
          }) ?? "",
        blur: 5,
        brightness: 100,
      },
      avatar: user.displayAvatarURL({
        forceStatic: true,
        extension: "png",
      }),
    });

    await interaction.editReply({ files: [rankCard] });
  }
}

void container.stores.loadPiece({
  name: "profile-button",
  piece: ProfileButtonInteraction,
  store: "interaction-handlers",
});
