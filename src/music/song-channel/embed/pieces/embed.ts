import { type APIEmbed, Colors, type Guild } from "discord.js";

import { resolveKey } from "@/i18n";
import { kil } from "@/db/Kil";
import { playerEmbedArts } from "@/db/schemas/player-embed-arts";

export const createDefaultSongEmbed = async (
  guild: Guild,
): Promise<APIEmbed> => {
  const mention = guild.members.me?.toString() ?? "@Twokei";

  const arts = await kil.select().from(playerEmbedArts);

  const randomArt = arts[Math.floor(Math.random() * arts.length)];

  const description = await resolveKey(guild, "player:embed.description", {
    mention,
    artwork: {
      name: randomArt.author || "",
      url: randomArt.authorUrl || "",
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
