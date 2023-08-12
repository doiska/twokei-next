import type { APIEmbed } from 'discord.js';
import { Colors } from 'discord.js';

function createEmbed (defaultData: APIEmbed & { appendStart?: string }) {
  // eslint-disable-next-line func-names
  return function (rawContent: string | string[] | APIEmbed): APIEmbed {
    const {
      appendStart = '',
      ...defaultEmbed
    } = defaultData;

    if (typeof rawContent === 'string') {
      const [firstLine, ...rest] = rawContent.split('\n');

      const lastHashPosition = firstLine.lastIndexOf('#', 4);

      if (lastHashPosition !== -1) {
        const prefix = firstLine.substring(0, lastHashPosition + 1);
        const restOfFirstLine = firstLine.substring(lastHashPosition + 2);

        const content = `${prefix} ${appendStart} ${restOfFirstLine}`;

        return {
          description: [content, ...rest].join('\n'),
          ...defaultEmbed,
        };
      }

      return {
        ...(rawContent !== '' && { description: rawContent }),
        ...defaultEmbed,
      };
    }

    if (Array.isArray(rawContent)) {
      return {
        description: rawContent.join('\n'),
        ...defaultEmbed,
      };
    }

    return {
      ...rawContent,
      ...defaultEmbed,
    };
  };
}

export const Embed = {
  error: createEmbed({
    color: Colors.Red,
    appendStart: '<:hanakin:1121884455225786478>',
  }),
  info: createEmbed({
    color: Colors.Blue,
    appendStart: '<:hanakin:1121884455225786478>',
  }),
  loading: createEmbed({
    color: Colors.Yellow,
    appendStart: '✨',
  }),
  success: createEmbed({
    color: Colors.Green,
    appendStart: '<a:raio:1121849523854118973>',
  }),
} as const;
