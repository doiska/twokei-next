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

export { isNullOrUndefined as isNullish };