import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
  Option,
} from "@sapphire/framework";
import {
  ButtonInteraction,
  Colors,
  EmbedBuilder,
  time as formatTime,
  TimestampStyles,
} from "discord.js";
import { EmbedButtons } from "@/constants/buttons";
import { Awaitable } from "@sapphire/utilities";
import { isValidCustomId } from "@/utils/helpers";
import { kil } from "@/db/Kil";
import { listeningRanking } from "@/db/schemas/analytics-track-info";
import { asc, eq } from "drizzle-orm";
import { coreUsers } from "@/db/schemas/core-users";
import { formatDuration, intervalToDuration } from "date-fns";
import { resolveKey } from "@/i18n";
import { ptBR } from "date-fns/locale";
import { coreScheduler } from "@/db/schemas/core-scheduler";

@ApplyOptions<InteractionHandler.Options>({
  name: EmbedButtons.VIEW_RANKING,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class RankingViewButtonHandler extends InteractionHandler {
  async run(buttonInteraction: ButtonInteraction) {
    await buttonInteraction.deferReply({
      ephemeral: true,
      fetchReply: true,
    });

    const ranking = await kil
      .select({
        userId: coreUsers.id,
        username: coreUsers.name,
        position: listeningRanking.position,
        listenedInMs: listeningRanking.listenedInMs,
      })
      .from(listeningRanking)
      .rightJoin(coreUsers, eq(coreUsers.id, listeningRanking.userId))
      .orderBy(asc(listeningRanking.position));

    const [rankingCron] = await kil
      .select({ lastRefresh: coreScheduler.updatedAt })
      .from(coreScheduler)
      .where(eq(coreScheduler.service, "refresh-ranking"));

    const refreshedAt = rankingCron?.lastRefresh ?? new Date();

    const topTen = ranking.slice(0, 9);

    const currentUserRanking = ranking.find(
      (user) => user.userId === buttonInteraction.user.id,
    );

    const isUserInTopTen = topTen.some(
      (user) => user.userId === buttonInteraction.user.id,
    );

    const formattedRanking = topTen.map((user, index) =>
      this.formatRanking({
        username: user.username,
        listenedInMs: parseInt(user.listenedInMs ?? 0),
        position: index + 1,
      }),
    );

    if (!isUserInTopTen && currentUserRanking) {
      formattedRanking.push(
        this.formatRanking({
          username: currentUserRanking.username,
          listenedInMs: parseInt(currentUserRanking.listenedInMs ?? 0),
          position: currentUserRanking.position,
        }),
      );
    }

    const rankingDescription = await resolveKey(
      buttonInteraction,
      "interactions:ranking.embed.main",
    );

    const refreshedAtText = await resolveKey(
      buttonInteraction,
      "interactions:ranking.embed.refreshedAt",
      {
        time: formatTime(refreshedAt, TimestampStyles.RelativeTime),
      },
    );

    const rankingEmbed = new EmbedBuilder()
      .setDescription(
        [rankingDescription, ...formattedRanking, " ", refreshedAtText].join(
          "\n",
        ),
      )
      .setColor(Colors.Gold);

    await buttonInteraction.editReply({
      embeds: [rankingEmbed],
    });
  }

  parse(buttonInteraction: ButtonInteraction): Awaitable<Option<unknown>> {
    return isValidCustomId(
      buttonInteraction.customId,
      EmbedButtons.VIEW_RANKING,
    );
  }

  private formatRanking({
    username,
    listenedInMs,
    position,
  }: {
    username: string;
    listenedInMs: number;
    position: number;
  }) {
    const timeToDuration = intervalToDuration({
      start: 0,
      end: listenedInMs,
    });

    const formattedDuration = formatDuration(timeToDuration, {
      format: ["days", "hours", "minutes"],
      locale: ptBR,
    });

    return `**${position}**. ${username} - ${formattedDuration}`;
  }
}

void container.stores.loadPiece({
  name: "ranking-view-button",
  piece: RankingViewButtonHandler,
  store: "interaction-handlers",
});
