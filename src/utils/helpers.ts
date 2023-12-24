import { Option } from "@sapphire/framework";

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function isValidCustomId(
  customId: string,
  expected: string | string[],
) {
  return [expected].flat().includes(customId)
    ? Option.some(customId)
    : Option.none;
}

type OnlyProperties<T> = {
  // ts-expect-error because we're using a hacky way to get the keys of T
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type KeyGetter<T> = ((item: T) => string) | OnlyProperties<T>;

export function groupBy<T>(list: T[], getKey: KeyGetter<T>): Map<string, T[]> {
  return list.reduce((map, currentItem) => {
    const key =
      typeof getKey === "function"
        ? getKey(currentItem)
        : (currentItem[getKey as keyof T] as unknown as string);

    const current = map.get(key) || [];
    current.push(currentItem);
    map.set(key, current);

    return map;
  }, new Map<string, T[]>());
}
