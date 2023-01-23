import { Venti } from './Venti';
import {
  ActionRowBuilder,
  APIEmbed,
  Message,
  StringSelectMenuBuilder
} from 'discord.js';
import { Kazu } from './Kazu';
import { assertEmbedSize } from '../../utils/embed-utils';
import { createSongEmbed, songEmbedPlaceHolder } from '../../embed/SongEmbed';

export class Scara {

  private player: Venti;
  private kazu: Kazu;
  private message: Message;

  private embed: Partial<APIEmbed> = {};
  private components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];

  public constructor(player: Venti, message: Message) {
    this.player = player;
    this.message = message;
    this.kazu = new Kazu(player);
    this.embed = createSongEmbed(message.guild!);
    this.components = [];
  }

  public setEmbed(newEmbed?: Partial<APIEmbed>) {
    const currentEmbed = createSongEmbed(this.message.guild!);

    if (!currentEmbed) {
      return this;
    }

    this.embed = assertEmbedSize({
      ...currentEmbed,
      ...newEmbed
    });

    console.log(this.embed)

    return this;
  }

  public setComponents(components?: ActionRowBuilder<StringSelectMenuBuilder>[]) {
    this.components = components ?? [];
    return this;
  }

  public refreshComponents() {
    const row = this.createSelectMenu();
    this.components = [row];
    return this;
  }

  private createSelectMenu() {
    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    const menu = new StringSelectMenuBuilder();

    menu.setCustomId('queue');
    menu.setPlaceholder('Select a song to play');
    menu.setMinValues(1);
    menu.setMaxValues(1);

    try {
      const items = this.kazu.getSongsAsItem();
      menu.addOptions(...items);
    } catch (e) {
      console.error(e);
    }

    return row.addComponents([menu]);
  }

  public refresh() {
    this.message.edit({
      embeds: [this.embed],
      components: this.components
    });
  }
}