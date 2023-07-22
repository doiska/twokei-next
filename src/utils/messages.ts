import { Colors } from 'discord.js';
import type { APIEmbed } from 'discord.js';

function createEmbed (defaultData: APIEmbed & { appendStart?: string }) {
  // eslint-disable-next-line func-names
  return function (data: string | string[] | APIEmbed): APIEmbed {
    const {
      appendStart = '',
      ...defaultEmbed
    } = defaultData;

    if (typeof data === 'string') {
      return {
        ...(data !== '' && { description: `${appendStart} ${data}` }),
        ...defaultEmbed,
      };
    }

    if (Array.isArray(data)) {
      return {
        description: data.join('\n'),
        ...defaultEmbed,
      };
    }

    return {
      ...data,
      ...defaultEmbed,
    };
  };
}

export const Embed = {
  error: createEmbed({
    color: Colors.Red,
    appendStart: '### <:hanakin:1121884455225786478>',
  }),
  loading: createEmbed({
    color: Colors.Yellow,
    appendStart: '### <a:hanakoeating:1121884717290094652>',
  }),
  success: createEmbed({
    color: Colors.Green,
    appendStart: '### <a:raio:1121849523854118973>',
  }),
} as const;
