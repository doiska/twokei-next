import { EmbedData, GuildMember, PermissionResolvable, User, LocalizationMap } from "discord.js";

export enum CommandExceptionType {
  CommandNotFound = "Command not found.",
  MissingPermissions = "You don't have permission to use this command.",
}

export type Command = {
  name: string;
  description?: string;
  aliases?: string[];
  usage?: string;
  category?: string;
  cooldown?: number;
  ownerOnly?: boolean;
  guildOnly?: boolean;
  nsfw?: boolean;
  args?: boolean;
  permissions?: PermissionResolvable;
  examples?: string[];
  active?: boolean;
  nameLocales?: LocalizationMap;
  descriptionLocales?: LocalizationMap;
  execute: (context: CommandContext) => CommandResponse | Promise<CommandResponse>;
}

export type CommandContext = {
  command: string;
  user: User;
  member?: GuildMember;
  args?: (string | boolean | number | undefined)[];

}

export type CommandResponse = void | string | EmbedData;