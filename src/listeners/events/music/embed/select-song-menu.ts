import { createEvent } from 'twokei-framework';
import { Interaction } from 'discord.js';
import { Twokei } from '../../../../app/Twokei';
import { Menus } from '../../../../constants/music';

export const selectMenuEvent = createEvent('interactionCreate', (interaction: Interaction) => {

  if (!interaction.isStringSelectMenu()) {
    return;
  }

  if (interaction.customId !== Menus.SelectSongMenu) {
    return;
  }

  if (!interaction.guild) {
    return;
  }

  const player = Twokei.xiao.getPlayer(interaction.guild.id);

  if (!player) {
    return;
  }

  const [value] = interaction.values;

  if (!value) {
    player.pause(true);
    return;
  }

  player.pause(false);

  if (value === 'previous') {
    if (!player.queue.previous) {
      return;
    }

    player.play(player.queue.previous, { replace: true });
    return interaction.reply({ content: 'Previous track', ephemeral: true });
  }

  if (value === 'current') {
    return interaction.reply({ content: 'Current track', ephemeral: true });
  }

  const id = Number(value);

  if (Number.isNaN(id)) {
    console.log('NaN');
    return;
  }

  if (id < 0 || id > player.queue.length) {
    console.log('Out of range');
    return;
  }

  player.skip(id + 1);

  interaction.reply({ content: `Skipped ${id} tracks`, ephemeral: true });
})