import {
  ActionRowBuilder,
  APIEmbed,
  Message,
  MessageActionRowComponentBuilder,
  SelectMenuBuilder,
} from 'discord.js';

import { Locale } from '../../locales/i18n';
import { logger } from '../../modules/logger-transport';
import { Venti } from '../controllers/Venti';
import { TrackQueue } from '../structures/TrackQueue';
import {
  createDefaultButtons,
  createDefaultSongEmbed,
  createPrimaryButtons,
  createSecondaryButtons,
  selectSongMenu,
} from './create-song-embed';
import { parseTracksToMenuItem } from './guild-embed-manager-helper';

export class GuildEmbed {
  private readonly message: Message;

  private embed: APIEmbed;

  private components: ActionRowBuilder<MessageActionRowComponentBuilder>[];

  private readonly player: Venti;

  private readonly locale: Locale;

  constructor(venti: Venti, message: Message, locale: Locale = 'pt_br') {
    this.player = venti;
    this.message = message;

    this.embed = createDefaultSongEmbed(locale);
    this.components = createDefaultButtons(locale);

    this.locale = locale;
  }

  public refreshEmbed() {
    if (!this.player) {
      logger.error('Player not found');
      return this;
    }

    const { queue } = this.player;
    const url = queue.current?.uri || '';

    this.embed = {
      ...this.embed,
      url,
      image: {
        url: queue.current?.thumbnail || this.embed.thumbnail?.url || '',
      },
    };

    return this;
  }

  public refreshComponents() {
    if (!this.player) {
      logger.error('Player not found');
      return this;
    }

    this.components = [
      this.createSelectMenu(this.player.queue),
      ...this.createButtons(),
    ];

    return this;
  }

  public reset() {
    this.embed = createDefaultSongEmbed(this.locale);
    this.components = createDefaultButtons(this.locale);

    return this;
  }

  public refresh() {
    logger.debug('[Xiao] Refreshing message...');
    this.message.edit({ components: this.components, embeds: [this.embed] });
  }

  private createButtons() {
    return [
      createPrimaryButtons(this.player),
      createSecondaryButtons(this.player),
    ];
  }

  private createSelectMenu(queue: TrackQueue) {
    const row = selectSongMenu;
    const menu = row.components[0] as SelectMenuBuilder;

    menu.setOptions(parseTracksToMenuItem(queue));
    menu.setDisabled(false);

    return row.setComponents(menu);
  }
}
