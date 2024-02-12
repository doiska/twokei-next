import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ButtonInteraction, Colors, User } from "discord.js";
import { isValidCustomId } from "@/utils/helpers";
import { EmbedButtons } from "@/constants/buttons";
import { createProfile } from "@/canvas/profile/base";

import { intervalToDuration, isBefore } from "date-fns";
import { getCoreUser } from "@/lib/users";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import { getExternalProfile } from "@/lib/arts/get-external-profile";
import { kil } from "@/db/Kil";
import { listeningRanking } from "@/db/schemas/analytics-track-info";
import { eq } from "drizzle-orm";
import { playerEmbedArts } from "@/db/schemas/player-embed-arts";

const badges = [
  {
    name: "Early Supporter",
    color: Colors.DarkRed.toString(16),
    condition: async (user: User) => {
      const coreUser = await getCoreUser(user);
      return isBefore(coreUser.createdAt, new Date("2024-01-01"));
    },
  },
  {
    name: "Premium",
    color: Colors.DarkGold.toString(16),
    condition: async (user: User) => {
      const coreUser = await getCoreUser(user);
      return coreUser.role === "premium";
    },
  },
  {
    name: "Top 10",
    color: Colors.DarkGold.toString(16),
    condition: async (user: User) => {
      const [ranking] = await kil
        .select()
        .from(listeningRanking)
        .where(eq(listeningRanking.userId, user.id));

      return Number(ranking?.position) <= 10;
    },
  },
];

@ApplyOptions<InteractionHandler.Options>({
  name: "profile-button",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
class ProfileButtonInteraction extends InteractionHandler {
  public parse(buttonInteraction: ButtonInteraction) {
    return isValidCustomId(
      buttonInteraction.customId,
      EmbedButtons.VIEW_PROFILE,
    );
  }

  public async run(interaction: ButtonInteraction) {
    if (!isGuildMember(interaction.member)) {
      return interaction.reply({
        content: "You must be in a server to use this command",
        ephemeral: true,
      });
    }

    await interaction.deferReply({
      ephemeral: true,
      fetchReply: true,
    });

    const user = await interaction.user.fetch(true);
    const externalProfile = await getExternalProfile(user.id);

    const [ranking] = await kil
      .select()
      .from(listeningRanking)
      .where(eq(listeningRanking.userId, user.id));

    const { hours = 0, minutes = 0 } = intervalToDuration({
      start: 0,
      end: Number(ranking?.listenedInMs) ?? 0,
    });

    const avatar = user.displayAvatarURL({
      extension: "webp",
      size: 1024,
      forceStatic: true,
    });

    const banner = user.bannerURL({
      forceStatic: true,
      extension: "png",
      size: 1024,
    });

    const [art] = await kil
      .select()
      .from(playerEmbedArts)
      .then((arts) => arts.sort(() => Math.random() - 0.5));

    const rankCard = await createProfile({
      outline: {
        theme: externalProfile?.data.profile_theme ?? [
          `#${Colors.White.toString(16)}`,
        ],
      },
      user: {
        name: user.displayName.slice(0, 25),
        badges: badges
          .filter((badge) => badge.condition(user))
          .map((badge) => ({
            name: badge.name,
            color: badge.color,
          })),
        avatar: avatar,
      },
      background: {
        url: banner ?? art.url,
        blur: 6,
        brightness: 30,
      },
      stats: {
        ranking: ranking?.position.toString() ?? `+999`,
        listenedSongs: ranking?.listenedCount.toString() ?? "0",
        totalPlayTime: `${hours > 0 ? `${hours}h` : ""} ${
          minutes > 0 ? `${minutes}m` : ""
        }`,
      },
    });

    await interaction.editReply({ files: [rankCard] });
  }
}

void container.stores.loadPiece({
  name: "profile-button",
  piece: ProfileButtonInteraction,
  store: "interaction-handlers",
});
