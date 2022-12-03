import { Command, CommandContext, CommandResponse } from "./command.types";
import { Twokei } from "../../app/Twokei";
import { SlashCommandBuilder } from "discord.js";
import glob from "fast-glob";
import fs from 'node:fs';
import { LocaleString } from "discord-api-types/rest/common";
import { LocalizationMap } from "discord-api-types/v10";
import { bgRed } from "kleur";

type OmitCommandParams = 'execute' | 'nameLocales' | 'descriptionLocales';

export const registerCommand = (
  command: Omit<Command, OmitCommandParams>,
  execute: (context: CommandContext) => (CommandResponse | Promise<CommandResponse>)
) => {


  const { name: commandName } = command;
  // console.log(`Registering command ${commandName}`);

  if (!commandName) {
    throw new Error(`Command name is required.`);
  }

  const alreadyExists = Twokei.commands.has(commandName);

  if (alreadyExists) {
    throw new Error(`Command ${commandName} already exists.`);
  }

  const newCommand = {
    ...command,
    execute,
  } as Command;

  const translation = getCommandTranslation(commandName);

  if (translation) {
    const { names, descriptions } = splitTranslations(commandName, translation);
    newCommand.nameLocales = names;
    newCommand.descriptionLocales = descriptions;
  }

  Twokei.commands.set(commandName, newCommand);

  return newCommand;
}

type Translation = Record<LocaleString, { name: string, description: string }>

export const getCommandTranslation = (name: string) => {
  const file = glob.sync(`./lang/commands/${name}.json`, { cwd: process.cwd() });

  if (!file?.[0]) {
    return;
  }

  const fileContent = fs.readFileSync(file[0], 'utf-8');
  return JSON.parse(fileContent) as Translation;
}


const splitTranslations = (command: string, translation: Translation) => {
  const names: LocalizationMap = {};
  const descriptions: LocalizationMap = {};

  for (const [_locale, { name, description }] of Object.entries(translation)) {
    const locale = _locale.replace('_', '-') as LocaleString;

    if (!name || !description) {
      console.log(bgRed().bold(`Missing translation for ${command} command: ${locale}.`));
      continue;
    }

    names[locale] = name;
    descriptions[locale] = description;
  }

  return { names, descriptions };
}

export const parseCommandToSlashJSON = (command: Command) => {
  const name = command.nameLocales?.['en-US'] ?? command.name;
  const description = command.descriptionLocales?.['en-US'] ?? command.description ?? 'No description provided.';

  if (!name || !description) {
    throw new Error(`Command ${command.name} is missing a name or description for en-US locale.`);
  }

  const previewSlash = new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .setDefaultMemberPermissions(command.permissions as bigint)
    .setNameLocalizations(command.nameLocales || {})
    .setDescriptionLocalizations(command.descriptionLocales || {});

  const slash = command.slash?.(previewSlash) ?? previewSlash;

  return slash.toJSON();
}