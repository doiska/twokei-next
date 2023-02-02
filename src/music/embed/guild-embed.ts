import {
  ActionRowBuilder,
  APIEmbed,
  Message,
  SelectMenuBuilder,
  Snowflake
} from 'discord.js';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
import { createDefaultSongComponents, createDefaultSongEmbed } from './create-song-embed';
import { Locale } from '../../translation/i18n';
import { Venti } from '../controllers/Venti';
import { TrackQueue } from '../managers/TrackQueue';
import { Track } from 'shoukaku';
import { parseTracksToMenuItem } from './guild-embed-manager-helper';
import { logger } from '../../modules/logger-transport';
import { Menus } from '../../constants/music';

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
    this.components = [createDefaultSongComponents(locale)];

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

    this.components = [this.createSelectMenu(this.player.queue)];

    return this;
  }

  private setEmbed(embed: APIEmbed) {
    this.embed = {
      ...this.embed,
      ...embed
    }
    return this;
  }

  private createSelectMenu(queue: TrackQueue<Track>) {
    const row = createDefaultSongComponents(this.locale);
    const menu = row.components[0] as SelectMenuBuilder;

    menu.setOptions(parseTracksToMenuItem(queue));
    menu.setDisabled(false);

    return row.setComponents(menu);
  }

  public reset() {
    this.player = undefined;
    this.embed = createDefaultSongEmbed(this.locale);
    this.components = [createDefaultSongComponents(this.locale)];
    return this;
  }

  public refresh() {
    this.player = undefined;
    this.message.edit({ components: this.components, embeds: [this.embed] });
  }
}