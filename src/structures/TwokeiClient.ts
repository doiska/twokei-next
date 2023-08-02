import {
  type APIEmbed,
  type BaseMessageOptions,
  type ClientOptions,
  EmbedBuilder,
  type InteractionReplyOptions,
  type Message,
  type ModalSubmitInteraction, type RepliableInteraction,
} from 'discord.js';
import {
  isAnyInteractableInteraction,
} from '@sapphire/discord.js-utilities';
import { container, SapphireClient } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { type Awaitable, noop } from '@sapphire/utilities';

import { SongProfileManager } from '@/features/song-profile/SongProfileManager';
import { type Locale } from '@/locales/i18n';
import { Analytics } from '@/structures/Analytics';
import { SongChannelManager } from '@/structures/SongChannels';
import { isEmbed } from '@/utils/embed-utils';

import { fetchLanguage, type Target } from 'twokei-i18next';

type AnyRepliableContext = Exclude<RepliableInteraction, ModalSubmitInteraction> | Message;
type RepliableContent = APIEmbed | BaseMessageOptions | EmbedBuilder | string | InteractionReplyOptions;

export class TwokeiClient extends SapphireClient {
  public constructor (options: ClientOptions) {
    super(options);

    container.sc = new SongChannelManager();
    container.profiles = new SongProfileManager();
    container.analytics = new Analytics();

    // TODO: move outside
    container.reply = this.reply.bind(this);
  }

  async parseContent (
    content: RepliableContent,
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

  async reply<T extends AnyRepliableContext>(
    interaction: T,
    content: RepliableContent,
    deleteInSeconds = 15,
  ) {
    if (isAnyInteractableInteraction(interaction)) {
      return await this.replyToInteraction(interaction, content, deleteInSeconds);
    }

    return await this.replyToMessage(interaction, content, deleteInSeconds);
  }

  private async replyToMessage (
    message: Message,
    content: RepliableContent,
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

    return response;
  }

  private async replyToInteraction (
    interaction: Exclude<RepliableInteraction, ModalSubmitInteraction>,
    content: RepliableContent,
    deleteInSeconds = 15,
  ) {
    const contentParsed = await this.parseContent(content);
    if (deleteInSeconds) {
      setTimeout(() => {
        interaction
          .deleteReply()
          .catch(noop);
      }, deleteInSeconds * 1000);
    }

    if (interaction.replied || interaction.deferred) {
      return await interaction.editReply(contentParsed);
    } else {
      return await interaction.reply(contentParsed);
    }
  }

  fetchLanguage (context: Target): Awaitable<Locale> {
    return fetchLanguage(context) as Awaitable<Locale>;
  }
}

declare module '@sapphire/pieces' {
  interface Container {
    reply: TwokeiClient['reply']
  }
}
