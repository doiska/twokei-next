import type { ButtonInteraction, Interaction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";

import { EmbedButtons } from "@/constants/music/player-buttons";

import { fetchApi } from "@/lib/api";
import { kil } from "@/db/Kil";
import { coreUsers } from "@/db/schemas/core-users";
import { inArray } from "drizzle-orm";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  userMention,
} from "discord.js";
import { fetchT } from "@sapphire/plugin-i18next";
import { getDateLocale } from "@/locales/i18n";
import { formatDuration, intervalToDuration } from "date-fns";
import { defer, followUp, send } from "@/lib/message-handler";
import { isValidCustomId } from "@/utils/helpers";

@ApplyOptions<InteractionHandler.Options>({
  name: "ranking-button",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class RankingButtonInteraction extends InteractionHandler {
  public async run(interaction: ButtonInteraction): Promise<void> {
    const ranking = await fetchApi<{
      ranking: { userId: string; listened: number }[];
      current: { userId: string; listened: number; position: number };
    }>(`/ranking?include=${interaction.user.id}`);

    if (ranking.status !== "success") {
      return;
    }

    await defer(interaction);

    const usersWithName = await kil
      .select({
        id: coreUsers.id,
        name: coreUsers.name,
      })
      .from(coreUsers)
      .where(
        inArray(
          coreUsers.id,
          ranking.data.ranking.map((user) => user.userId),
        ),
      );

    const usersRankedWithName = ranking.data.ranking
      .map((user) => {
        const userWithName = usersWithName.find((u) => u.id === user.userId);

        return {
          ...user,
          name: userWithName?.name ?? "Usuário não encontrado",
        };
      })
      .filter(Boolean);

    if (!usersRankedWithName.length) {
      return;
    }

    const t = await fetchT(interaction);

    const emoji = {
      "1": ":first_place:",
      "2": ":second_place:",
      "3": ":third_place:",
    } as Record<string, string>;

    const locale = await getDateLocale(interaction);

    const [first, ...rest] = usersRankedWithName.map((user, index) => {
      const rankEmoji = emoji?.[index + 1] ?? ":medal:";

      const { days, hours, minutes } = intervalToDuration({
        start: 0,
        end: user.listened * 1000,
      });

      return `${rankEmoji} **${user.name}** - ${formatDuration(
        {
          days,
          hours,
          minutes,
        },
        {
          delimiter: ", ",
          format: ["days", "hours", "minutes"],
          locale,
        },
      )}`;
    });

    const twokeiMention = userMention(
      interaction.guild?.members?.me?.id ?? "1096133130852769792",
    );

    const description = [
      t("interactions:ranking.embed.main"),
      first,
      ...rest,
    ].join("\n");

    const mainEmbed = new EmbedBuilder()
      .setDescription(description)
      .setColor(Colors.Red);

    const rulesButton = new ButtonBuilder()
      .setLabel("Regras do Ranking")
      .setCustomId("ranking-rules-button")
      .setEmoji("📜")
      .setStyle(ButtonStyle.Primary);

    const ephemeralEmbed = new EmbedBuilder()
      .setDescription(
        t("interactions:ranking.embed.ephemeral", {
          currentPosition: {
            position: ranking.data.current?.position ?? "N/A",
            listened: await this.formatMinutes(
              interaction,
              ranking.data.current?.listened ?? 0,
            ),
          },
          twokeiMention,
        }),
      )
      .setColor(Colors.Yellow);

    const row = new ActionRowBuilder<ButtonBuilder>({
      components: [rulesButton],
    });

    await send(interaction, {
      embeds: [mainEmbed],
      components: [row],
    }).dispose();

    await followUp(interaction, {
      embeds: [ephemeralEmbed],
      ephemeral: true,
    }).dispose(10000);
  }

  public parse(interaction: ButtonInteraction) {
    return isValidCustomId(interaction.customId, EmbedButtons.VIEW_RANKING);
  }

  private async formatMinutes(interaction: Interaction, listened: number) {
    const { days, hours, minutes } = intervalToDuration({
      start: 0,
      end: listened * 1000,
    });

    return formatDuration(
      {
        days,
        hours,
        minutes,
      },
      {
        delimiter: ", ",
        format: ["days", "hours", "minutes"],
        locale: await getDateLocale(interaction),
      },
    );
  }
}
