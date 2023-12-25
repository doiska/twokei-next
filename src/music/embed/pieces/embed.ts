import { type APIEmbed, Colors, formatEmoji, type Guild } from "discord.js";

import { resolveKey } from "@sapphire/plugin-i18next";
import { kil } from "@/db/Kil";
import { playerEmbedArts } from "@/db/schemas/player-embed-arts";
import { sql } from "drizzle-orm";

export const createDefaultSongEmbed = async (
  guild: Guild,
): Promise<APIEmbed> => {
  const mention = guild.members.me?.toString() ?? "@Twokei";

  const lightEmoji = formatEmoji("1069597636950249523");

  const [randomArt] = await kil
    .select()
    .from(playerEmbedArts)
    .orderBy(sql`random()`)
    .limit(1);

  const description = await resolveKey(guild, "player:embed.description", {
    joinArrays: "\n",
    returnObjects: false,
    emoji: lightEmoji,
    mention,
  });

  return {
    description,
    color: Colors.Blurple,
    image: {
      url: randomArt.url,
    },
    author: {
      name: "Feito por: doiska.dev",
      url: "https://twitter.com/dois2ka",
    },
    footer: {
      text: `${randomArt.author} | ${randomArt.authorUrl} - Envie sua arte: https://forms.gle/avym7rVa4UNzHHm97`,
    },
  };
};
