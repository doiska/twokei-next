import {
  BaseMessageOptions, Message,
} from 'discord.js';
import { send } from '@sapphire/plugin-editable-commands';
import { Command } from '@sapphire/framework';

import { RandomMessages } from '@/constants/random-messages';

export const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

export async function reply<
  T extends Message | Command.ChatInputCommandInteraction,
>(interaction: T, replyOptions: BaseMessageOptions | string, deleteAfterSeconds = 0) {
  const isMessage = interaction instanceof Message;

  if (isMessage) {
    await send(interaction, replyOptions);
  } else if (interaction.replied) {
    await interaction.editReply(replyOptions);
  } else {
    await interaction.reply(replyOptions);
  }

  if (deleteAfterSeconds) {
    setTimeout(async () => {
      if (isMessage) {
        await interaction.delete()
          .catch(noop);
      } else {
        await interaction.deleteReply()
          .catch(noop);
      }
    }, (deleteAfterSeconds * 1000) + 1000);
  }
}

export const getRandomLoadingMessage = () => {
  const random = Math.floor(Math.random() * Object.keys(RandomMessages).length);
  return `messages:${Object.values(RandomMessages)[random]}`;
};

export type Maybe<T> = T | null | undefined;
