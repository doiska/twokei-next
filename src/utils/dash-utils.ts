import { type TFunction } from 'twokei-i18next';

export function translateFields<T extends Record<any, any>> (target: T, keys: Array<keyof T>, t: TFunction): T {
  return Object.keys(target)
    .reduce<Record<string, unknown>>((acc, key) => {
    const value = target[key];
    if (!keys.includes(key)) {
      acc[key] = value;
      return acc;
    }
    acc[key] = t(value as string);

    return acc;
  }, {}) as T;
}
