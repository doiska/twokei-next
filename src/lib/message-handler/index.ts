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

export type MessageHandlerOptions =
  | MessageCreateOptions
  | MessageReplyOptions
  | MessageEditOptions;

type Repliable = Message | RepliableInteraction;

const replies = new WeakMap<Repliable, Message>();

class MessageHandlerPromise extends CustomHandler<Message> {
  private readonly interaction: Repliable;
  private readonly options: string | MessageHandlerOptions;

  constructor(interaction: Repliable, options: string | MessageHandlerOptions) {
    super();
    this.interaction = interaction;
    this.options = options;
  }

  async execute(): Promise<Message> {
    return handle(this.interaction, this.options);
  }

  dispose(timeout = 15000) {
    setTimeout(() => {
      if (isAnyInteraction(this.interaction)) {
        this.interaction.deleteReply().catch(noop);
      } else {
        this.interaction.delete().catch(noop);
      }

      replies.delete(this.interaction);
    }, timeout);
    return this;
  }
}

export function send(
  interaction: Repliable,
  options: string | MessageHandlerOptions,
) {
  console.log(`Theres ${Object.keys(replies).length} replies loaded.`);
  return new MessageHandlerPromise(interaction, options);
}

async function handle<T extends MessageHandlerOptions>(
  interaction: Repliable,
  options: string | T,
  extra?: T | undefined,
): Promise<Message> {
  if (!interaction.channel) {
    throw new Error("No channel specified.");
  }

  const existing = replies.get(interaction);

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

  replies.set(interaction, response);

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

    replies.delete(message);
    return message.reply(payload);
  }
}
