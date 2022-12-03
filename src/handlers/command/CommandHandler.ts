import {
  CommandInteraction,
  GuildMember,
  Interaction,
  Message, TextBasedChannel,
} from "discord.js";
import { CommandContext, CommandExceptionType, CommandResponse } from "./command.types";
import { Twokei } from "../../app/Twokei";

function prepareInteraction(interaction: CommandInteraction): Omit<CommandContext, 'client'>  {

  const optionsAsKV = interaction.options.data.reduce(
    (acc, option) => (
      {
        ...acc,
        [option.name]: option.value
      }
    ), {} as Record<string, any>
  );

  return {
    args: optionsAsKV,
    command: interaction.commandName,
    guild: interaction.guild,
    user: interaction.user,
    channel: interaction.channel as TextBasedChannel,
    member: interaction.member as GuildMember,
  }
}

function prepareMessage(message: Message): Omit<CommandContext, 'client'> {
  const args = message.content.split(/ +/);
  const command = args.shift()?.toLowerCase() as string;

  return {
    command,
    args: args || [],
    guild: message.guild,
    user: message.author,
    channel: message.channel as TextBasedChannel,
    member: message.member as GuildMember,
  }
}

export async function handleCommand(interaction: Message | Interaction): Promise<CommandResponse> {
  const isMessage = interaction instanceof Message;

  if (!isMessage && !interaction.isChatInputCommand()) {
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

  return command.execute({ client: Twokei,  ...context });
}