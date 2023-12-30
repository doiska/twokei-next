import { type APIEmbed, Colors, type Guild } from "discord.js";

import { resolveKey } from "@sapphire/plugin-i18next";
import { kil } from "@/db/Kil";
import { playerEmbedArts } from "@/db/schemas/player-embed-arts";
import { sql } from "drizzle-orm";

export const createDefaultSongEmbed = async (
  guild: Guild,
): Promise<APIEmbed> => {
  const mention = guild.members.me?.toString() ?? "@Twokei";

  const [randomArt] = await kil
    .select()
    .from(playerEmbedArts)
    .orderBy(sql`random()`)
    .limit(1);

  const description = await resolveKey(guild, "player:embed.description", {
    joinArrays: "\n",
    returnObjects: false,
    mention,
    artwork: {
      name: randomArt.author,
      url: randomArt.authorUrl,
    },
  });

  return {
    description,
    color: Colors.Blurple,
    image: {
      url: randomArt.url,
    },
    footer: {
      text: `⚡ Made by: https://doiska.dev`,
      icon_url: "https://cdn.twokei.com/doiska.png",
    },
  };
};
