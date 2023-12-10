import { Message } from "discord.js";
import { container } from "@sapphire/framework";

export async function validateSongChannel(
  message: Message,
  songChannelId?: string,
) {
  const { channel: typedChannel, guild } = message;

  if (!guild || !typedChannel) {
    return "no-channel";
  }

  const hasMentionedTwokei = message.mentions.members?.has(
    container.client.id!,
  );

  const isInSongChannel = songChannelId === typedChannel.id;

  if (!isInSongChannel) {
    // Caso tenha mencionado o Twokei, mas NÃO esteja no canal de música
    if (hasMentionedTwokei) {
      // Caso o canal de música não exista
      if (!songChannelId) {
        return "song-channel-does-not-exists";
      }

      // Caso o canal de música exista, mas não seja o canal atual
      return "not-in-song-channel";
    }

    // Caso NÃO tenha mencionado o Twokei e também NÃO esteja no canal de música
    return "ignore";
  }

  if (hasMentionedTwokei) {
    return "same-channel";
  }

  return "same-channel-no-mention";
}
