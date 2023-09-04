import type { ButtonInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
  type None,
  type Option,
} from "@sapphire/framework";

import { EmbedButtons } from "@/constants/music/player-buttons";

import { fetchApi } from "@/lib/api";
import { kil } from "@/db/Kil";
import { users } from "@/db/schemas/users";
import { eq, inArray } from "drizzle-orm";
import { songRanking } from "@/db/schemas/song-ranking";
import { Colors, EmbedBuilder, GuildMember, userMention } from "discord.js";
import { fetchT } from "@sapphire/plugin-i18next";
import { getDateLocale } from "@/locales/i18n";
import { formatDuration, intervalToDuration } from "date-fns";
import { send } from "@/lib/message-handler";

@ApplyOptions<InteractionHandler.Options>({
  name: "ranking-button",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class RankingButtonInteraction extends InteractionHandler {
  public async run(interaction: ButtonInteraction): Promise<void> {
    const ranking =
      await fetchApi<{ userId: string; listened: number }[]>("/ranking");

    if (ranking.status !== "success") {
      return;
    }

    const usersWithName = await kil
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(
        inArray(
          users.id,
          ranking.data.map((user) => user.userId),
        ),
      );

    const usersRankedWithName = ranking.data
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

    const [currentPosition] = await kil
      .select({
        listened: songRanking.listened,
        position: songRanking.position,
      })
      .from(songRanking)
      .where(eq(songRanking.userId, (interaction.member as GuildMember)!.id))
      .limit(1);

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

    const ephemeralEmbed = new EmbedBuilder()
      .setDescription(
        t("interactions:ranking.embed.ephemeral", {
          currentPosition,
          twokeiMention,
        }),
      )
      .setColor(Colors.Yellow);

    await send(interaction, {
      embeds: [mainEmbed],
    }).dispose();

    await interaction.followUp({
      embeds: [ephemeralEmbed],
      ephemeral: true,
    });
  }

  public parse(interaction: ButtonInteraction): Option<None> {
    if (interaction.customId !== EmbedButtons.VIEW_RANKING) {
      return this.none();
    }

    return this.some();
  }
}
