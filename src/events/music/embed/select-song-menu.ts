import { createEvent } from 'twokei-framework';
import { Interaction } from 'discord.js';
import { Twokei } from '../../../app/Twokei';
import { Menus } from '../../../constants/music';

export const selectMenuEvent = createEvent('interactionCreate', (interaction: Interaction) => {

  if(!interaction.isStringSelectMenu()) {
    return;
  }

  if(interaction.customId !== Menus.SelectSongMenu) {
    return;
  }

  if(!interaction.guild) {
    return;
  }

  const player = Twokei.xiao.getPlayer(interaction.guild.id);

  if(!player) {
    return;
  }

  const [value] = interaction.values;

  if(!value) {
    player.pause(true);
    return;
  }

  player.pause(false);

  if(value === 'previous') {
    console.log('Previous');
    if(!player.queue.previous) {
      console.log('No previous')
      return;
    }

    console.log('Previous', player.queue.previous.info);

    player.play(player.queue.previous, { noReplace: false, replaceCurrent: true });
    return;
  }

  if(value === 'current') {
    console.log('Current');
    return;
  }

  const id = Number(value);

  if(Number.isNaN(id)) {
    console.log('NaN');
    return;
  }

  if(id < 0 || id > player.queue.length) {
    console.log('Out of range');
    return;
  }

  player.skip(id + 1);
  console.log('Skip', id)
})