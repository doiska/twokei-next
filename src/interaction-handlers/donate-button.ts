import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  Colors,
  ComponentType,
  EmbedBuilder,
} from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import {
  InteractionHandler,
  InteractionHandlerTypes, type None, type Option,
} from '@sapphire/framework';

import { EmbedButtons } from '@/constants/music/player-buttons';

import { fetchT } from 'twokei-i18next';

@ApplyOptions<InteractionHandler.Options>({
  name: 'donate-button',
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class PlayerButtonsInteraction extends InteractionHandler {
  public async run (
    interaction: ButtonInteraction,
  ) {
    if (!interaction.guild || !isGuildMember(interaction.member)) {
      return;
    }

    const t = await fetchT(interaction);

    const embed = new EmbedBuilder()
      .setDescription(t('donate.description', { ns: 'common' }))
      .setColor(Colors.Gold);

    const pixButton = new ButtonBuilder()
      .setLabel(t('donate.buttons.pix', { ns: 'common' }))
      .setStyle(ButtonStyle.Primary)
      .setCustomId('pix');

    const paypalButton = new ButtonBuilder()
      .setLabel(t('donate.buttons.paypal', { ns: 'common' }))
      .setStyle(ButtonStyle.Link)
      .setURL('https://ko-fi.com/doiska');

    const voteButton = new ButtonBuilder()
      .setLabel(t('donate.buttons.vote', { ns: 'common' }))
      .setStyle(ButtonStyle.Link)
      .setURL('https://top.gg/bot/804289482624587274/vote');

    const row = new ActionRowBuilder<ButtonBuilder>({
      components: [
        pixButton,
        paypalButton,
        voteButton,
      ],
    });

    const interactionResponse = await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    const collector = interactionResponse.awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'pix',
      time: 60000,
    });

    void collector.then((i) => {
      const pixEmbed = new EmbedBuilder()
        .setDescription(t('donate.pix.description', { ns: 'common' }))
        .setImage('https://cdn.discordapp.com/attachments/1122869530302087220/1127698486515732500/Screenshot_2023-07-09_173032.png');

      void i.update({
        embeds: [pixEmbed],
        components: [row.setComponents([paypalButton, voteButton])],
      });
    });

    collector.catch(async () => { await interaction.deleteReply(); });
  }

  public override parse (interaction: ButtonInteraction): Option<None> {
    const customId = interaction.customId;

    console.log(customId);

    if (customId !== EmbedButtons.DONATE) {
      return this.none();
    }

    return this.some();
  }
}
