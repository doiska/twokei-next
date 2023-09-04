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
