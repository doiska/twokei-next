import { type APIEmbed, Colors, type Guild } from "discord.js";

import { fetchT } from "@/i18n";
import { kil } from "@/db/Kil";
import { playerEmbedArts } from "@/db/schemas/player-embed-arts";

export const createDefaultSongEmbed = async (
  guild: Guild,
): Promise<APIEmbed> => {
  const t = await fetchT(guild);

  const mention = guild.members.me?.toString() ?? "@Twokei";

  const arts = await kil.select().from(playerEmbedArts);
  const randomArt = arts[Math.floor(Math.random() * arts.length)];

  const description = [
    t("player:embed.description.default", {
      mention,
    }),
  ];

  if (randomArt) {
    description.push(
      t("player:embed.description.arts", {
        artwork: {
          name: randomArt.author || "No author",
          url: randomArt.authorUrl || "https://twokei.com",
        },
      }),
    );
  }

  return {
    description: description.join("\n"),
    color: Colors.Blurple,
    image: {
      url: randomArt.url,
    },
    footer: {
      text: `⚡ Made by: @two2kei | doiska#0001`,
      icon_url: "https://cdn.twokei.com/doiska.png",
    },
  };
};
