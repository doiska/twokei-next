import { CustomHandler } from "@/lib/message-handler/custom-handler";
import type {
  MessageReplyOptions,
  RepliableInteraction,
  MessageCreateOptions,
  MessageEditOptions,
} from "discord.js";

import {
  DiscordAPIError,
  Message,
  MessagePayload,
  RESTJSONErrorCodes,
} from "discord.js";
import {
  isAnyInteractableInteraction,
  isAnyInteraction,
} from "@sapphire/discord.js-utilities";
import { noop } from "@sapphire/utilities";
import { logger } from "@/modules/logger-transport";

export type MessageHandlerOptions =
  | MessageCreateOptions
  | MessageReplyOptions
  | MessageEditOptions;

type Repliable = Message | RepliableInteraction;

const replies = new Map<string, Message>();

class MessageHandlerPromise extends CustomHandler<Message> {
  constructor(
    private readonly interaction: Repliable,
    private readonly options: string | MessageHandlerOptions,
    private readonly method: "send" | "followUp" = "send",
  ) {
    super();
  }

  async execute(): Promise<Message> {
    if (this.method === "followUp") {
      return await handleFollowUp(this.interaction, this.options);
    }

    return handle(this.interaction, this.options);
  }

  dispose(milliseconds = 15000) {
    setTimeout(() => {
      const key = `${this.interaction.id}-${this.method}`;
      const responseMessage = replies.get(key);

      if (responseMessage) {
        responseMessage.delete().catch((e) => logger.error(e));
        logger.debug(`[${this.method}] Message handler disposed using delete.`);
        replies.delete(key);
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
  extra?: T | undefined,
): Promise<Message> {
  if (!interaction.channel) {
    throw new Error("No channel specified.");
  }

  const payload = await MessagePayload.create(
    interaction.channel,
    resolvePayload(options),
    extra,
  )
    .resolveBody()
    .resolveFiles();

  let response: Message;
  if (isAnyInteractableInteraction(interaction)) {
    await interaction.followUp(payload);
    response = await interaction.fetchReply();
  } else {
    response = await interaction.reply(payload);
  }

  replies.set(`${interaction.id}-followUp`, response);
  return response;
}

async function handle<T extends MessageHandlerOptions>(
  interaction: Repliable,
  options: string | T,
  extra?: T | undefined,
): Promise<Message> {
  if (!interaction.channel) {
    throw new Error("No channel specified.");
  }

  const existing = replies.get(`${interaction.id}-send`);

  const payloadOptions = existing
    ? resolveEditPayload(existing, options as MessageEditOptions)
    : resolvePayload(options);

  const payload = await MessagePayload.create(
    interaction.channel,
    payloadOptions,
    extra,
  )
    .resolveBody()
    .resolveFiles();

  const response = await (existing
    ? tryEdit(existing, interaction, payload)
    : tryReply(interaction, payload));

  replies.set(`${interaction.id}-send`, response);

  return response;
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

function resolveEditPayload(
  currentMessage: Message,
  options: string | MessageEditOptions,
) {
  options = resolvePayload(options);

  if (currentMessage.embeds.length) {
    options.embeds ??= [];
  }

  if (currentMessage.attachments.size) {
    options.files ??= [];
  }

  return options;
}

async function tryReply(
  message: Repliable,
  payload: MessagePayload,
): Promise<Message> {
  if (isAnyInteractableInteraction(message)) {
    await message.reply(payload);
    return message.fetchReply();
  }

  return message.reply(payload);
}

async function tryEdit(
  message: Repliable,
  response: Repliable,
  payload: MessagePayload,
) {
  try {
    if (isAnyInteractableInteraction(response)) {
      return await response.editReply(payload);
    }

    return await response.edit(payload);
  } catch (error) {
    if (!(error instanceof DiscordAPIError)) {
      throw error;
    }

    if (error.code !== RESTJSONErrorCodes.UnknownMessage) {
      throw error;
    }

    if (isAnyInteractableInteraction(message)) {
      await message.reply(payload);
      return message.fetchReply();
    }

    replies.delete(`${message.id}-send`);
    return message.reply(payload);
  }
}
