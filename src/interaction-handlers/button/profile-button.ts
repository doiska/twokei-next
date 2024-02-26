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

import { isBefore } from "date-fns";
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
      return coreUser?.role === "premium";
    },
  },
  {
    name: "Top 10",
    color: Colors.DarkGold.toString(16),
    condition: async (user: User) => {
      const [ranking] = await kil
        .select({ position: listeningRanking.position })
        .from(listeningRanking)
        .where(eq(listeningRanking.userId, user.id));

      if (!ranking?.position) {
        return false;
      }

      return ranking.position <= 10;
    },
  },
];

const formatPlayTime = (ms: number) => {
  const hours = Math.floor(ms / 3.6e6);
  const minutes = Math.floor((ms % 3.6e6) / 6e4);

  if (!minutes && !hours) {
    return "0m";
  }

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
};

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

    const avatar = user.displayAvatarURL({
      extension: "webp",
      size: 1024,
      forceStatic: true,
    });

    const banner = user.bannerURL({
      forceStatic: true,
      extension: "webp",
      size: 1024,
    });

    const [art] = await kil
      .select()
      .from(playerEmbedArts)
      .then((arts) => arts.sort(() => Math.random() - 0.5));

    const userBadges = await Promise.all(
      badges.map(async (badge) => {
        if (await badge.condition(user)) {
          return {
            name: badge.name,
            color: badge.color,
          };
        }
      }),
    );

    const rankCard = await createProfile({
      user: {
        name: user.displayName.slice(0, 25),
        badges: userBadges.filter(Boolean),
        avatar: avatar,
      },
      outline: {
        theme: externalProfile?.data.profile_theme ?? [
          `#${Colors.White.toString(16)}`,
        ],
      },
      background: {
        url: banner ?? art.url,
        blur: 6,
        brightness: 30,
      },
      stats: {
        ranking: ranking?.position.toString() ?? `999+`,
        listenedSongs: ranking?.listenedCount.toString() ?? "0",
        totalPlayTime: formatPlayTime(ranking?.listenedInMs ?? 0),
      },
    });

    //TODO: cache the profile card

    await interaction.editReply({ files: [rankCard] });
  }
}

void container.stores.loadPiece({
  name: "profile-button",
  piece: ProfileButtonInteraction,
  store: "interaction-handlers",
});
