import { CustomHandler } from "@/lib/message-handler/custom-handler";
import type {
  InteractionReplyOptions,
  MessageCreateOptions,
  MessageEditOptions,
  MessageReplyOptions,
  RepliableInteraction,
} from "discord.js";
import { DiscordAPIError, Message, RESTJSONErrorCodes } from "discord.js";
import {
  isAnyInteractableInteraction,
  isAnyInteraction,
} from "@sapphire/discord.js-utilities";
import { noop } from "@sapphire/utilities";
import { logger } from "@/lib/logger";

type MessageHandlerEditOptions =
  | MessageCreateOptions
  | MessageReplyOptions
  | MessageEditOptions;

export type MessageHandlerOptions = MessageHandlerEditOptions & {
  ephemeral?: boolean;
};

type Repliable = Message | RepliableInteraction;

class MessageHandlerPromise extends CustomHandler<Message> {
  private result?: Message;

  constructor(
    private readonly interaction: Repliable,
    private readonly options: string | MessageHandlerOptions,
    private readonly type: "send" | "followUp" = "send",
  ) {
    super();
  }

  async execute(): Promise<Message> {
    const result = await (this.type === "followUp"
      ? handleFollowUp(this.interaction, this.options)
      : handle(this.interaction, this.options));

    this.result = result;
    return result;
  }

  dispose(milliseconds = 15000) {
    setTimeout(() => {
      if (this.result) {
        this.result.delete().catch(noop);
        return;
      }

      if (isAnyInteraction(this.interaction)) {
        this.interaction.deleteReply().catch(noop);
      } else {
        this.interaction.delete().catch(noop);
      }
    }, milliseconds);
    return this;
  }
}

export async function defer(
  interaction: Repliable,
  options?: { ephemeral: true },
) {
  if (isAnyInteractableInteraction(interaction)) {
    return interaction.deferReply({
      ephemeral: options?.ephemeral ?? false,
      fetchReply: true,
    });
  }

  return interaction;
}

export function send(
  interaction: Repliable,
  options: string | MessageHandlerOptions,
) {
  return new MessageHandlerPromise(interaction, options);
}

export function followUp(
  interaction: Repliable,
  options: string | MessageHandlerOptions,
) {
  return new MessageHandlerPromise(interaction, options, "followUp");
}

async function handleFollowUp<T extends MessageHandlerOptions>(
  interaction: Repliable,
  options: string | T,
): Promise<Message> {
  if (isAnyInteractableInteraction(interaction)) {
    return interaction.followUp(options as InteractionReplyOptions);
  }

  return (
    interaction.channel?.send(options as MessageCreateOptions) ?? interaction
  );
}

async function handle<T extends MessageHandlerOptions>(
  interaction: Repliable,
  options: string | T,
): Promise<Message> {
  if (!interaction.channel) {
    throw new Error("No channel specified.");
  }

  const payloadOptions = resolvePayload(options);

  return tryReply(interaction, payloadOptions as MessageCreateOptions);
}

function resolvePayload<T extends MessageHandlerOptions>(
  options: string | T,
): T {
  if (typeof options === "string") {
    return {
      content: options,
      components: [],
    } as unknown as T;
  }

  return {
    components: [],
    ...options,
  } as T;
}

async function tryReply(
  message: Repliable,
  payload: InteractionReplyOptions | MessageCreateOptions,
): Promise<Message> {
  try {
    if (isAnyInteractableInteraction(message)) {
      if (message.deferred) {
        return message.editReply(payload as InteractionReplyOptions);
      }

      return message.reply({
        ...(payload as InteractionReplyOptions),
        fetchReply: true,
      });
    }

    return message.reply(payload as MessageReplyOptions);
  } catch (error) {
    logger.error(`Failed to reply to message: ${error}`);

    if (!(error instanceof DiscordAPIError)) {
      throw error;
    }

    if (
      ![
        RESTJSONErrorCodes.UnknownInteraction,
        RESTJSONErrorCodes.CannotReplyWithoutPermissionToReadMessageHistory,
        RESTJSONErrorCodes.InvalidFormBodyOrContentType,
        RESTJSONErrorCodes.UnknownMessage,
      ].includes(error.code as RESTJSONErrorCodes)
    ) {
      throw error;
    }

    if (!message.channel) {
      throw new Error("No channel specified.");
    }

    return message.channel.send(payload as MessageCreateOptions);
  }
}
