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

import { isBefore } from "date-fns";
import { getCoreUser } from "@/lib/users";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { getExternalProfile } from "@/lib/arts/get-external-profile";

const getBadge = (
  condition: boolean,
  badge: { name: string; color?: string; image?: string },
) => {
  return condition && badge;
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
    if (!isGuildMember(interaction.member))
      return interaction.reply({
        content: "You must be in a server to use this command",
        ephemeral: true,
      });

    await interaction.deferReply({
      ephemeral: true,
      fetchReply: true,
    });

    const user = await interaction.user.fetch(true);

    const dbUser = await getCoreUser(user);
    const externalProfile = await getExternalProfile(user.id);

    const earlySupporterBadge = getBadge(
      isBefore(dbUser.createdAt, new Date("2024-01-01")),
      {
        name: "Early Supporter",
      },
    );

    const premiumBadge = getBadge(dbUser?.role === "premium", {
      name: "Premium",
      color: Colors.DarkGold.toString(16),
    });

    const rankCard = await createProfile({
      outline: {
        theme: externalProfile?.data.profile_theme ?? [
          Colors.White.toString(16),
        ],
      },
      user: {
        name: `Teste de nick grande`,
        badges: [earlySupporterBadge, premiumBadge].slice(0, 3).filter(Boolean),
        ranking: 134,
      },
      background: {
        url:
          user.bannerURL({
            forceStatic: true,
            extension: "png",
            size: 1024,
          }) ?? "",
        blur: 12,
        brightness: 20,
      },
      avatar: interaction.member.displayAvatarURL({
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
