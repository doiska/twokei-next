import {
  Colors,
  EmbedBuilder,
  GuildMember,
  Message,
  ModalSubmitInteraction,
  type RepliableInteraction,
  userMention,
} from "discord.js";
import { kil } from "@/db/Kil";
import { songRanking } from "@/db/schemas/song-ranking";
import { users } from "@/db/schemas/users";
import { asc, eq } from "drizzle-orm";
import { Icons } from "@/constants/icons";
import { sendPresetMessage } from "@/utils/utils";

export async function showRanking(
  interaction: Exclude<RepliableInteraction, ModalSubmitInteraction> | Message,
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

  const emoji = {
    "1": ":first_place:",
    "2": ":second_place:",
    "3": ":third_place:",
  } as Record<string, string>;

  const [first, second, third, ...rest] = ranking.map((user) => {
    const rankEmoji = emoji?.[user.position] ?? ":medal:";

    return `${rankEmoji} **${user.name}** - **${user.listened}** músicas ouvidas`;
  });

  const twokeiMention = userMention(
    interaction.guild?.members?.me?.id ?? "1096133130852769792",
  );

  const yourPosition = [
    `Você está em **#${currentPosition.position} lugar** com **${currentPosition.listened} músicas ouvidas**.`,
    `Suba no Ranking **escutando** músicas no ${twokeiMention}.`,
    " ",
    `Obrigado por fazer parte da nossa vibe! ${Icons.HanakoEating}`,
  ];

  const description = [
    `# ${Icons.Ranking} Twokei Global Ranking`,
    " ",
    `### Seja parte do **Top 3** e receba todos os benefícios do **${Icons.Premium} Premium**!`,
    "",
    `### ${first}`,
    `${second}`,
    `${third}`,
    ...rest,
    " ",
    ...yourPosition,
  ].join("\n");

  const embed = new EmbedBuilder()
    .setDescription(description)
    .setColor(Colors.Red);

  await sendPresetMessage({
    interaction,
    embeds: [embed],
    deleteIn: 30,
    preset: "success",
  });
}
