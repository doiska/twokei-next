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

type KeyGetter<T, R> = (item: T) => R;

export function groupBy<T, R extends string | number | symbol>(
  list: T[],
  getKey: KeyGetter<T, R>,
) {
  return list.reduce(
    (map, currentItem) => {
      const key = getKey(currentItem);
      const current = map[key] ?? [];

      current.push(currentItem);

      map[key] = current;
      return map;
    },
    {} as Record<ReturnType<typeof getKey>, T[]>,
  );
}
