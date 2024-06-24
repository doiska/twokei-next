import type { APIEmbed } from "discord.js";
import { Colors } from "discord.js";

function createEmbed(defaultData: APIEmbed) {
  return function (rawContent: string): [APIEmbed] {
    if (!rawContent.trim()) {
      return [defaultData];
    }

    return [
      {
        ...defaultData,
        description: rawContent,
      },
    ];
  };
}

export const Embed = {
  error: createEmbed({
    color: Colors.Red,
    footer: {
      text: "Suporte: https://discord.twokei.com | Discord: @doiska",
    },
  }),
  info: createEmbed({
    color: Colors.Blue,
  }),
  loading: createEmbed({
    color: Colors.Yellow,
  }),
  success: createEmbed({
    color: Colors.Green,
  }),
} as const;
