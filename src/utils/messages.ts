import type { APIEmbed } from "discord.js";
import { Colors } from "discord.js";

function createEmbed(defaultData: APIEmbed) {
  return function (rawContent: string | string[] | APIEmbed): [APIEmbed] {
    const { ...defaultEmbed } = defaultData;

    if (typeof rawContent === "string") {
      return [
        {
          ...(rawContent !== "" && { description: rawContent }),
          ...defaultEmbed,
        },
      ];
    }

    if (Array.isArray(rawContent)) {
      return [
        {
          description: rawContent.join("\n"),
          ...defaultEmbed,
        },
      ];
    }

    return [
      {
        ...rawContent,
        ...defaultEmbed,
      },
    ];
  };
}

export const Embed = {
  error: createEmbed({
    color: Colors.Red,
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
