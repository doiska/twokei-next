import { Command, CommandContext, CommandResponse } from "./command.types";
import { Twokei } from "../../app/Twokei";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

export const registerCommand = (command: Omit<Command, 'execute'>, execute: (context: CommandContext) => CommandResponse | Promise<CommandResponse>) => {
  Twokei.commands.set(command.name, { ...command, execute });
}

export const parseCommandToSlashJSON = (command: Command) => {
  return new SlashCommandBuilder()
      .setName(command.name)
      .setDescription(command.description || "No description provided.")
      .setDefaultMemberPermissions(command.permissions as bigint)
      .setNameLocalizations(command.nameLocales || {})
      .setDescriptionLocalizations(command.descriptionLocales || {}).toJSON();
}