import {
  type BaseMessageOptions,
  type ClientOptions,
  EmbedBuilder,
  type EmbedData, type InteractionReplyOptions,
  type Message,
  type RepliableInteraction,
  type APIEmbed,
} from 'discord.js';
import { type Awaitable, noop } from '@sapphire/utilities';
import { send } from '@sapphire/plugin-editable-commands';
import { container, SapphireClient } from '@sapphire/framework';
import { isAnyInteractableInteraction } from '@sapphire/discord.js-utilities';

import { fetchLanguage, type Target } from 'twokei-i18next';
import { isEmbed } from '@/utils/embed-utils';
import { SongProfileManager } from '@/structures/SongProfile';
import { SongChannelManager } from '@/structures/SongChannels';
import { type Locale } from '@/locales/i18n';

export class TwokeiClient extends SapphireClient {
  public constructor (options: ClientOptions) {
    super(options);

    container.sc = new SongChannelManager();
    container.profiles = new SongProfileManager();
  }

  async parseContent (
    content: BaseMessageOptions | EmbedBuilder | string,
  ) {
    if (typeof content === 'string') {
      return content;
    }

    if (isEmbed(content)) {
      const embedData = content instanceof EmbedBuilder ? content.data : content;
      return {
        embeds: [embedData],
      };
    }

    return content as BaseMessageOptions;
  }

  async replyTo (
    interaction: Message | RepliableInteraction,
    content: BaseMessageOptions | EmbedBuilder | string | InteractionReplyOptions,
    deleteInSeconds = 15,
  ) {
    if (isAnyInteractableInteraction(interaction)) {
      await this.replyToInteraction(interaction, content, deleteInSeconds); return;
    }

    await this.replyToMessage(interaction, content, deleteInSeconds);
  }

  private async replyToMessage (
    message: Message,
    content: BaseMessageOptions | EmbedBuilder | string,
    deleteInSeconds = 15,
  ) {
    const contentParsed = await this.parseContent(content);
    const response = await send(message, contentParsed);

    if (deleteInSeconds) {
      setTimeout(() => {
        response
          .delete()
          .catch(noop);
      }, deleteInSeconds * 1000);
    }
  }

  private async replyToInteraction (
    interaction: RepliableInteraction,
    content: BaseMessageOptions | EmbedBuilder | string | InteractionReplyOptions,
    deleteInSeconds = 15,
  ) {
    const contentParsed = await this.parseContent(content);

    console.log(interaction.replied);
    console.log(interaction.deferred);

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(contentParsed);
    } else {
      await interaction.reply(contentParsed);
    }

    if (deleteInSeconds) {
      setTimeout(() => {
        interaction
          .deleteReply()
          .catch(noop);
      }, deleteInSeconds * 1000);
    }
  }

  fetchLanguage (context: Target): Awaitable<Locale> {
    return fetchLanguage(context) as Awaitable<Locale>;
  }
}

declare module '@sapphire/framework' {
  interface SapphireClient {
    replyTo(
      interaction: Message | RepliableInteraction,
      content: EmbedBuilder | BaseMessageOptions | string | EmbedData | APIEmbed | InteractionReplyOptions,
      deleteInSeconds?: number,
    ): Promise<void>

    fetchLanguage (context: Target): Awaitable<Locale>
  }
}
