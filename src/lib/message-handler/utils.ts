import { Message, RepliableInteraction } from "discord.js";
import { isNumber, noop } from "@sapphire/utilities";
import { isAnyInteraction } from "@sapphire/discord.js-utilities";

export function stripContent(content: string) {
  return content.replace(/<@!?\d+>/g, "").replace(/[^\w\s]/gi, "");
}

export function dispose(
  message: Message | RepliableInteraction,
  milliseconds = 15000,
) {
  const disposalTime = isNumber(milliseconds) ? milliseconds : 15000;

  setTimeout(() => {
    if (message instanceof Message) {
      message.delete().catch(noop);
      return;
    }

    if (isAnyInteraction(message)) {
      message.deleteReply().catch(noop);
    }
  }, disposalTime);
}
