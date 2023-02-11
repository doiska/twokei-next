import {
  ActionRowBuilder, APIButtonComponentWithCustomId,
  APIEmbed,
  ButtonBuilder,
  ButtonStyle,
  Message,
  MessageActionRowComponentBuilder,
  SelectMenuBuilder,
  Snowflake
} from 'discord.js';
import {
  createDefaultButtons,
  createDefaultMenu,
  createDefaultSongEmbed,
  createPrimaryRow,
  createSecondaryRow
} from './create-song-embed';
import { Locale } from '../../translation/i18n';
import { Venti } from '../controllers/Venti';
import { TrackQueue } from '../managers/TrackQueue';
import { Track } from 'shoukaku';
import { parseTracksToMenuItem } from './guild-embed-manager-helper';
import { logger } from '../../modules/logger-transport';

export class GuildEmbed {

  private guildId: Snowflake;
  private message: Message;

  private embed: APIEmbed;
  private components: ActionRowBuilder<MessageActionRowComponentBuilder>[];
  private player?: Venti;

  private readonly locale: Locale;

  constructor(guildId: Snowflake, message: Message, locale: Locale = 'pt_br') {
    this.guildId = guildId;
    this.message = message;

    this.embed = createDefaultSongEmbed(locale);
    this.components = [
      createDefaultMenu(locale),
      createDefaultButtons(locale)
    ];

    this.locale = locale;
  }

  public from(player: Venti) {
    this.player = player;

    return this;
  }

  public refreshEmbed() {

    if (!this.player) {
      logger.error('Player not found');
      return this;
    }

    const queue = this.player.queue;
    const title = queue.current?.info.title || 'Nenhuma música tocando';
    const url = queue.current?.info.uri || '';

    this.setEmbed({
      title,
      url
    });

    return this;
  }

  public refreshComponents() {
    if (!this.player) {
      logger.error('Player not found');
      return this;
    }

    this.components = [this.createSelectMenu(this.player.queue), ...this.createButtons(this.player.paused)];

    return this;
  }

  private setEmbed(embed: APIEmbed) {
    this.embed = {
      ...this.embed,
      ...embed
    }

    return this;
  }

  private createButtons(paused = false) {

    const primaryRow = createPrimaryRow(this.locale);
    const secondaryRow = createSecondaryRow(this.locale);

    const primaryButtons = primaryRow.components as ButtonBuilder[];

    primaryRow.setComponents(primaryButtons.map((button) => {
      const { custom_id } = button.data as APIButtonComponentWithCustomId;


      if(custom_id.toLowerCase() === 'pause') {
        button.setLabel(paused ? 'Continuar' : 'Pausar');
      }

      return button;
    }));

    return [
      primaryRow,
      secondaryRow
    ]
  }

  private createSelectMenu(queue: TrackQueue<Track>) {
    const row = createDefaultMenu(this.locale);
    const menu = row.components[0] as SelectMenuBuilder;

    menu.setOptions(parseTracksToMenuItem(queue));
    menu.setDisabled(false);

    return row.setComponents(menu);
  }

  public reset() {
    this.player = undefined;
    this.embed = createDefaultSongEmbed(this.locale);
    this.components = [
      createDefaultMenu(this.locale),
      createDefaultButtons(this.locale)
    ];
    return this;
  }

  public refresh() {
    logger.debug(`[Xiao] Refreshing message...`);
    this.message.edit({ components: this.components, embeds: [this.embed] });
  }
}