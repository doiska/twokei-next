import {
  CommandInteraction,
  GuildMember,
  Interaction,
  TextBasedChannel,
} from "discord.js";
import { CommandContext, CommandExceptionType, CommandResponse } from "./command.types";
import { Twokei } from "../../app/Twokei";

function prepareInteraction(interaction: CommandInteraction): Omit<CommandContext, 'client' | 't'>  {

  const optionsAsKV = interaction.options.data.reduce(
    (acc, option) => (
      {
        ...acc,
        [option.name]: option.value
      }
    ), {} as Record<string, any>
  );

  return {
    options: optionsAsKV,
    command: interaction.commandName,
    guild: interaction.guild,
    user: interaction.user,
    channel: interaction.channel as TextBasedChannel,
    member: interaction.member as GuildMember,
    interaction: interaction
  }
}

export async function handleCommand(interaction: Interaction): Promise<CommandResponse> {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const context = prepareInteraction(interaction);
  const command = Twokei.commands.get(context.command);

  if (!command) {
    throw new Error(CommandExceptionType.CommandNotFound);
  }

  const locale = context.interaction.locale;

  const translate = (key: string, ...args: string[]) => {
    console.log(`Translating ${key} for ${locale}`);
    return key;
  }

  return command.execute({ client: Twokei,  t: translate, ...context });
}