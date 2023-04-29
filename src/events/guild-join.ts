import { createEvent } from 'twokei-framework';
import { findAnyUsableChannel } from '../utils/channel-utilities';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Events, Locale, } from 'discord.js';
import { setupNewChannel } from '../modules/setup-new-channel';
import { logger } from '../modules/logger-transport';
import i18next from 'i18next';
import { Twokei } from '../app/Twokei';

export const guildJoin = createEvent(Events.GuildCreate, async guild => {
  const { id, name: guildName, memberCount } = guild;

  const adminUsableChannel = await findAnyUsableChannel(guild);

  if (!adminUsableChannel) {
    logger.warn(`Guild ${guildName} (${id}) has no usable channel for me :(`);
    return;
  }

  const t = i18next.getFixedT(guild.preferredLocale === Locale.PortugueseBR ? 'pt_br' : 'en_us', 'common');

  const description = t('onJoin', {
    joinArrays: '\n',
    'playCommand': `</play>`,
    'me': Twokei.user!.toString()
  });

  const row = new ActionRowBuilder<ButtonBuilder>();

  const createChannelButton = new ButtonBuilder()
      .setLabel('Create song channel for me :)')
      .setStyle(ButtonStyle.Primary)
      .setCustomId('create-channel');

  const cancelChannelButton = new ButtonBuilder()
      .setLabel('Only commands/mention :(')
      .setStyle(ButtonStyle.Danger)
      .setCustomId('cancel-channel');

  row.addComponents(createChannelButton, cancelChannelButton);

  const name = t('name');

  const embed = new EmbedBuilder()
      .setTitle(`:wave: Hi there :)! I'm ${name}!`)
      .setDescription(description);

  const introduction = await adminUsableChannel.send({ embeds: [embed], components: [row] });

  introduction.awaitMessageComponent({
    componentType: ComponentType.Button,
    filter: interaction => interaction.member.permissions.has('ManageChannels')
  })
      .then(async interaction => {
        if (interaction.customId === 'cancel-channel') {

          const description = [
            'That\'s fine, you can still use `/play` or **mention me**.',
            'If you change your mind, you can always use the command `/setup` again.'
          ]

          const embed = new EmbedBuilder()
              .setTitle('No channel created for me :(')
              .setDescription(description.join('\n'));

          return interaction.reply({ embeds: [embed] });
        }

        const description = [
          'Please wait while I create the channel.',
          '',
          '**Some things to know**:',
          'You can **move/rename** the channel (but `keep the permissions`), no problem.',
          'Before I forget, **mention and command still work**, so you can delete the channel whenever you want.',
          'If you delete the channel, you can always use the command `/setup` again.',
          '',
          'All good! Enjoy the music! :smiling_imp:'
        ]

        const embed = new EmbedBuilder()
            .setTitle(':heart_eyes:  Oh, you want to create a channel for me?')
            .setDescription(description.join('\n'));

        await setupNewChannel(adminUsableChannel, interaction.member);
        interaction.reply({ embeds: [embed] })
      })
      .catch((e) => {
        logger.error('Error while waiting for interaction', e);
        adminUsableChannel.send('Something went wrong, please try again or ask for support:' +
            ' https://discord.gg/twokei')
      })
      .finally(() => introduction.delete());
});