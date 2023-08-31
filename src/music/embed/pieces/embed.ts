import { type APIEmbed, Colors, formatEmoji, type Guild } from "discord.js";

import { fetchT } from "@sapphire/plugin-i18next";

const arts = [
  {
    name: "Summertime Vibes",
    url: "https://cdn.discordapp.com/attachments/1121890290442178651/1121891134537465939/FzAx_piaYAI9TR4.gif",
    author: "Kldpxl",
    authorUrl: "https://twitter.com/Kldpxl",
  },
];

export const createDefaultSongEmbed = async (
  guild: Guild,
): Promise<APIEmbed> => {
  const mention = guild.members.me?.toString() ?? "@Twokei";

  const lightEmoji = formatEmoji("1069597636950249523");
  const randomArt = arts[Math.floor(Math.random() * arts.length)];

  const t = await fetchT(guild);

  const description = t("player:embed.description", {
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
      height: 300,
      width: 300,
      proxy_url:
        "https://media.tenor.com/XAS0z1xPCIcAAAAd/cyberpunk-vaporwave.gif",
    },
    author: {
      name: "Feito por: doiska.dev",
      url: "https://twitter.com/dois2ka",
    },
    footer: {
      text: `Art: ${randomArt.author} - ${randomArt.authorUrl}`,
    },
  };
};
