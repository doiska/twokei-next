import { GuildMember } from 'discord.js';

export type Maybe<T> = T | null | undefined;

/**
 * Type union for the full 2 billion dollar mistake in the JavaScript ecosystem
 */
export type Nullish = null | undefined;


/**
 * Checks whether a value is `null` or `undefined`
 * @param value The value to check
 */
export function isNullOrUndefined(value: unknown): value is Nullish {
  return value === undefined || value === null;
}

export const isGuildMember = (value: unknown): value is GuildMember => value?.constructor.name === 'GuildMember';

export { isNullOrUndefined as isNullish };