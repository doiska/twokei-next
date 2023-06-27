import {EmbedLimits, SelectMenuLimits} from '@sapphire/discord.js-utilities';
import {APIEmbed, SelectMenuComponentOptionData} from 'discord.js';


export const assertEmbedSize = (embed: APIEmbed): APIEmbed => {
  return {
    ...embed,
    title: embed.title?.substring(0, EmbedLimits.MaximumTitleLength),
    author: {
      ...embed.author,
      name: embed.author?.name?.substring(0, 70) ?? '',
    },
    description: embed.description?.substring(0, EmbedLimits.MaximumDescriptionLength),
    fields: embed.fields?.map((field) => ({
      ...field,
      name: field.name.substring(0, EmbedLimits.MaximumFieldNameLength),
      value: field.value.substring(0, EmbedLimits.MaximumFieldValueLength),
    })),
    footer: {
      ...embed.footer,
      text: embed.footer?.text?.substring(0, EmbedLimits.MaximumFooterLength) ?? '',
    },
  };
};

export const assertMenuSize = (options: SelectMenuComponentOptionData[]) => {

  if (!options) return options;

  options = options?.slice(0, SelectMenuLimits.MaximumOptionsLength);

  return options.map((option) => ({
    ...option,
    label: option.label.substring(0, SelectMenuLimits.MaximumLengthOfNameOfOption),
    description: option.description?.substring(0, SelectMenuLimits.MaximumLengthOfNameOfOption),
  }));
};