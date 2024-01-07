import { Awaitable } from "@sapphire/utilities";

export function cache<Fn extends (...args: any[]) => Awaitable<any>>(
  fun: Fn,
): Fn {
  const cache = new Map<string, ReturnType<Fn>>();

  return (async (...args: Parameters<Fn>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<Fn>;
    }

    const result = await fun(...args);

    cache.set(key, result);

    return result;
  }) as Fn;
}

const sum = (a: number, b: number) => a + b;

const cachedSum = cache(sum);

cachedSum(1, 2); // 3
