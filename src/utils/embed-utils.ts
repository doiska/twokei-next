import {
  type APIEmbed,
  EmbedBuilder,
  type SelectMenuComponentOptionData,
} from "discord.js";
import { EmbedLimits, SelectMenuLimits } from "@sapphire/discord.js-utilities";
import { isNullish } from "@sapphire/utilities";

export function isEmbed(embed: unknown): embed is APIEmbed {
  const isEmbedBuilder = embed instanceof EmbedBuilder;
  const isEmbedObject =
    !!embed && typeof embed === "object" && "description" in embed;

  return !isNullish(embed) && (isEmbedBuilder || isEmbedObject);
}

export const assertEmbedSize = (embed: APIEmbed): APIEmbed => ({
  ...embed,
  title: embed.title?.substring(0, EmbedLimits.MaximumTitleLength),
  author: {
    ...embed.author,
    name: embed.author?.name?.substring(0, 70) ?? "",
  },
  description: embed.description?.substring(
    0,
    EmbedLimits.MaximumDescriptionLength,
  ),
  fields: embed.fields?.map((field) => ({
    ...field,
    name: field.name.substring(0, EmbedLimits.MaximumFieldNameLength),
    value: field.value.substring(0, EmbedLimits.MaximumFieldValueLength),
  })),
  footer: {
    ...embed.footer,
    text:
      embed.footer?.text?.substring(0, EmbedLimits.MaximumFooterLength) ?? "",
  },
});

export function assertMenuSizeLimits(
  options: SelectMenuComponentOptionData[],
): SelectMenuComponentOptionData[] {
  if (!options) return options;

  const slicedOptions = options?.slice(
    0,
    SelectMenuLimits.MaximumOptionsLength,
  );

  return slicedOptions.map((option) => ({
    ...option,
    label: option.label.substring(
      0,
      SelectMenuLimits.MaximumLengthOfNameOfOption,
    ),
    description: option.description?.substring(
      0,
      SelectMenuLimits.MaximumLengthOfNameOfOption,
    ),
  }));
}
