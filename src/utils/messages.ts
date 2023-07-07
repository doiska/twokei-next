import { Colors } from 'discord.js';
import type { APIEmbed } from 'discord.js';

export const Embed = {
  error: (description?: string, rest?: APIEmbed) => ({
    color: Colors.Red,
    description: `<:hanakin:1121884455225786478> ${description ?? 'An error occurred while executing this command.'}`,
    ...rest,
  }),
  loading: (description?: string, rest?: APIEmbed) => ({
    color: Colors.Yellow,
    description: `<a:hanakoeating:1121884717290094652> ${description ?? 'Loading...'}`,
    ...rest,
  }),
  success: (description?: string, rest?: APIEmbed) => ({
    color: Colors.Green,
    description: `<a:raio:1121849523854118973> ${description}`,
    ...rest,
  }),
} as const;
