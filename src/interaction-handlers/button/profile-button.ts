import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ButtonInteraction, Colors } from "discord.js";
import { isValidCustomId } from "@/utils/helpers";
import { EmbedButtons } from "@/constants/buttons";
import { logger } from "@/lib/logger";
import { createProfile } from "@/canvas/profile/base";

const decimalToHex = (decimal: number) => {
  return decimal.toString(16).padStart(2, "0");
};

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
      outline: {
        theme: [Colors.White.toString(16)].map((c) => `#${c}`),
      },
      user: {
        name: user.username,
        username: user.tag,
        badges: [
          {
            name: "DEV",
            color: decimalToHex(Colors.Blue),
          },
          {
            name: "Premium",
            color: decimalToHex(Colors.Gold),
          },
          {
            name: "Early Supporter",
            color: decimalToHex(Colors.Blurple),
          },
          {
            name: "Top 1",
            color: decimalToHex(Colors.Fuchsia),
          },
        ],
        ranking: 1,
      },
      background: {
        url:
          user.bannerURL({
            forceStatic: true,
            extension: "png",
            size: 1024,
          }) ?? "",
        blur: 3,
        brightness: 40,
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
