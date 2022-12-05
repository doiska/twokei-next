import {
  CommandInteraction,
  EmbedBuilder,
  EmbedData,
  Guild,
  GuildMember,
  PermissionResolvable,
  SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, TextBasedChannel, TextChannel,
  User
} from "discord.js";
import type { LocalizationMap } from 'discord-api-types/v10';
import { ExtendedClient } from "../../structures/ExtendedClient";

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
  permissions?: PermissionResolvable;
  examples?: string[];
  active?: boolean;
  nameLocales?: LocalizationMap;
  descriptionLocales?: LocalizationMap;
  slash?: (builder: SlashCommandBuilder) => SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
  execute: (context: CommandContext) => CommandResponse | Promise<CommandResponse>;
}

export type CommandContext<T = any> = {
  client: ExtendedClient,
  command: string;
  user: User;
  guild?: Guild | null;
  member?: GuildMember;
  channel?: TextBasedChannel
  options: T;
  interaction: CommandInteraction,
  t: (key: string, ...args: any[]) => string;
}

export type CommandResponse = void | string | EmbedData | EmbedBuilder;