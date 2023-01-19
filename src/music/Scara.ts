import { Venti } from './Venti';
import {
  ActionRowBuilder,
  APIEmbed,
  ComponentType,
  Message,
  SelectMenuBuilder,
  SelectMenuComponentOptionData, StringSelectMenuBuilder
} from 'discord.js';
import { Kazu } from './Kazu';

export class Scara {

  private player: Venti;
  private kazu: Kazu;
  private message: Message;

  public constructor(player: Venti, message: Message) {
    this.player = player;
    this.message = message;
    this.kazu = new Kazu(player);
  }

  public async refreshEmbed(newEmbed: Partial<APIEmbed>) {
    const currentEmbed = this.message.embeds[0];

    if (!currentEmbed) return;

    const newEmbedData = {
      ...currentEmbed,
      ...newEmbed
    }

    await this.message.edit({ embeds: [newEmbedData] });
  }

  public async refreshComponents(): Promise<void> {
    const row = this.createSelectMenu();

      await this.message.edit({ components: [row] });
  }

  private createSelectMenu() {
    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    const menu = new StringSelectMenuBuilder();

    menu.setCustomId('queue');
    menu.setPlaceholder('Select a song to play');
    menu.setMinValues(1);
    menu.setMaxValues(1);

    console.log(`Menu created.`);


    try {
      const items = this.kazu.getSongsAsItem();
      menu.addOptions(...items);
    } catch (e) {
      console.error(e);
    }

    return row.addComponents([menu]);
  }
}