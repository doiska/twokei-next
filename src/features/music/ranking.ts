import {
  Colors,
  EmbedBuilder,
  GuildMember,
  ModalSubmitInteraction,
  type RepliableInteraction,
  userMention,
} from "discord.js";
import { kil } from "@/db/Kil";
import { songRanking } from "@/db/schemas/song-ranking";
import { users } from "@/db/schemas/users";
import { asc, eq } from "drizzle-orm";
import { sendPresetMessage } from "@/utils/utils";
import { fetchT } from "@sapphire/plugin-i18next";

export async function showRanking(
  interaction: Exclude<RepliableInteraction, ModalSubmitInteraction>,
) {
  const ranking = await kil
    .select({
      id: users.id,
      name: users.name,
      listened: songRanking.listened,
      position: songRanking.position,
    })
    .from(songRanking)
    .innerJoin(users, eq(songRanking.userId, users.id))
    .orderBy(asc(songRanking.position))
    .limit(10);

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

  const [first, ...rest] = ranking.map((user) => {
    const rankEmoji = emoji?.[user.position] ?? ":medal:";

    return `${rankEmoji} **${user.name}** - **${user.listened}** músicas ouvidas`;
  });

  const twokeiMention = userMention(
    interaction.guild?.members?.me?.id ?? "1096133130852769792",
  );

  const description = [
    t("interactions:ranking.embed.main"),
    `### ${first}`,
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

  await sendPresetMessage({
    interaction,
    embeds: [mainEmbed],
    deleteIn: 30,
    preset: "success",
  });

  await interaction.followUp({
    embeds: [ephemeralEmbed],
    ephemeral: true,
  });
}
