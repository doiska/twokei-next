import { TextChannel } from "discord.js";
import { container } from "@sapphire/framework";
import { logger } from "@/lib/logger";

export async function cleanupSongChannel(
  channel: TextChannel,
  messageId: string,
) {
  try {
    const deletableMessages = await channel.messages.fetch();

    await channel.bulkDelete(
      deletableMessages.filter((m) => {
        const duration = Date.now() - m.createdTimestamp;
        const isMine = m.author.id === container.client.id;

        const isRecent = duration < 60000 && isMine;
        const isSongChannelMessage = m.id === messageId;

        return !isRecent && !isSongChannelMessage;
      }),
      true,
    );
  } catch (e) {
    logger.warn(
      `Failed to bulk delete messages in ${channel.id} (${channel.guild.id})`,
      e,
    );
  }
}
