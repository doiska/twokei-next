import {
  CommandInteraction,
  GuildMember,
  Interaction,
  Message,
  InteractionType,
  APIEmbed, EmbedData
} from "discord.js";
import { CommandContext, CommandExceptionType, CommandResponse } from "./command.types";
import { Twokei } from "../../app/Twokei";

function prepareInteraction(interaction: CommandInteraction): CommandContext {
  return {
    command: interaction.commandName,
    args: interaction.options.data.map((arg) => arg.value) || [],
    user: interaction.user,
    member: interaction.member as GuildMember,
  }
}

function prepareMessage(message: Message): CommandContext {
  const args = message.content.split(/ +/);
  const command = args.shift()?.toLowerCase() as string;

  return {
    command,
    args: args || [],
    user: message.author,
    member: message.member as GuildMember,
  }
}

export async function handleCommand(interaction: Message | Interaction): Promise<CommandResponse> {
  const isMessage = interaction instanceof Message;

  if (!isMessage && interaction.type !== InteractionType.ApplicationCommand) {
    return;
  }

  const context = isMessage ? await prepareMessage(interaction) : await prepareInteraction(interaction);
  const command = Twokei.commands.get(context.command);

  if (!command) {
    throw new Error(CommandExceptionType.CommandNotFound);
  }

  // const permissions = command.permissions || [];
  //
  // if (context.member && permissions && context.member.permissions.has(permissions)) {
  //   throw new Error(CommandExceptionType.MissingPermissions);
  // }

  return command.execute(context);
}