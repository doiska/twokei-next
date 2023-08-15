import { ActionRowBuilder, type ButtonInteraction, TextInputStyle } from 'discord.js';
import { ModalBuilder, TextInputBuilder } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, type None, type Option } from '@sapphire/framework';

import { Modals, SongProfileButtons } from '@/constants/music/player-buttons';

@ApplyOptions<InteractionHandler.Options>({
  name: 'profile-edit',
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ProfileEdit extends InteractionHandler {
  async run (interaction: ButtonInteraction) {
    const spotify = new TextInputBuilder()
      .setCustomId('spotify')
      .setLabel('Spotify Profile Url')
      .setPlaceholder('https://open.spotify.com/user/31cwujt4j433skqn5kledywywxge?si=6a3cb8890cc54e76')
      .setStyle(TextInputStyle.Short);

    const row = new ActionRowBuilder<TextInputBuilder>({
      components: [spotify],
    });

    const modal = new ModalBuilder()
      .setTitle('Profile Edit')
      .setCustomId(Modals.ProfileModal)
      .setComponents(row);

    await interaction.showModal(modal);
  }

  parse (buttonInteraction: ButtonInteraction): Option<None> {
    if (buttonInteraction.customId !== SongProfileButtons.EDIT_PROFILE) {
      return this.none();
    }

    return this.some();
  }
}
