import { ActivityType } from "discord.js";
import { container } from "@sapphire/framework";
import { logger } from "@/lib/logger";

const presences: [string, ActivityType][] = [
  ["music.twokei.com", ActivityType.Listening],
  ["⚡ Music bot: music.twokei.com", ActivityType.Custom],
];

const types = [
  "Playing",
  "Streaming",
  "Listening",
  "Watching",
  "Custom",
  "Competing",
] as const;

export async function execute() {
  const [name, type] = presences[Math.floor(Math.random() * presences.length)];

  container.client.user?.setActivity({ name, type });
  logger.info(`Rich presence updated to "${types[type]}: ${name}"`);
}
