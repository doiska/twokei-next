import {
  ActionRowBuilder,
  APIEmbed,
  Message,
  MessageActionRowComponentBuilder,
  SelectMenuBuilder,
  Snowflake
} from 'discord.js';
import {
  createDefaultButtons,
  createDefaultMenu,
  createDefaultSongEmbed, createPlaylistButtons,
  createPrimaryButtons,
  createSecondaryButtons
} from './create-song-embed';
import { Locale } from '../../translation/i18n';
import { Venti } from '../controllers/Venti';
import { TrackQueue } from '../managers/TrackQueue';
import { parseTracksToMenuItem } from './guild-embed-manager-helper';
import { logger } from '../../modules/logger-transport';
import { DynamicPlaylistButtons } from '../../constants/music';

export class GuildEmbed {

  private readonly guildId: Snowflake;
  private readonly message: Message;

  private embed: APIEmbed;
  private components: ActionRowBuilder<MessageActionRowComponentBuilder>[];

  private readonly player: Venti;
  private readonly locale: Locale;

  constructor(venti: Venti, guildId: Snowflake, message: Message, locale: Locale = 'pt_br') {
    this.player = venti;
    this.guildId = guildId;
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

    const queue = this.player.queue;
    const title = queue.current?.title || 'Nenhuma música tocando';
    const url = queue.current?.uri || '';

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

    this.components = [this.createSelectMenu(this.player.queue), ...this.createButtons()];

    return this;
  }

  private setEmbed(embed: APIEmbed) {
    this.embed = {
      ...this.embed,
      ...embed
    }

    return this;
  }

  private createButtons() {
    return [
      createPlaylistButtons(this.player.locale),
      createPrimaryButtons(this.player),
      createSecondaryButtons(this.player)
    ];
  }

  private createSelectMenu(queue: TrackQueue) {
    const row = createDefaultMenu(this.locale);
    const menu = row.components[0] as SelectMenuBuilder;

    menu.setOptions(parseTracksToMenuItem(queue));
    menu.setDisabled(false);

    return row.setComponents(menu);
  }

  public reset() {
    this.embed = createDefaultSongEmbed(this.locale);
    this.components = [
      createDefaultMenu(this.locale),
      ...createDefaultButtons(this.locale)
    ];
    return this;
  }

  public refresh() {
    logger.debug(`[Xiao] Refreshing message...`);
    this.message.edit({ components: this.components, embeds: [this.embed] });
  }
}