import { Venti } from './Venti';
import { SelectMenuComponentOptionData, StringSelectMenuComponentData } from 'discord.js';

export class Kazu {

  private player: Venti;

  constructor(player: Venti) {
    this.player = player;
  }

  public getSongsAsItem(): SelectMenuComponentOptionData[] {

    const previous = this.player.queue?.previous;
    const current = this.player.queue?.current;
    const songs = Array.from(this.player.queue || []).slice(0, 20);

    const items: SelectMenuComponentOptionData[] = [];

    if (previous) {
      console.log(`Previous: ${previous}`);
      items.push({
        label: `Previous: ${previous.info.title}`,
        value: 'previous',
        description: previous.info.author,
        emoji: { name: '⏮️' }
      });
    }

    if (current) {
      console.log(`Current: ${current.info.title}`);
      items.push({
        default: true,
        label: `Current: ${current.info.title}`,
        value: 'current',
        description: current.info.author,
        emoji: { name: '🎶' }
      });
    }

    items.push(...songs.map((song, index) => ({
      label: `${index + 1}: ${song.info.title}`,
      value: `${index}`,
      description: song.info.author,
    })));

    return items;
  }
}