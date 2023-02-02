import { createEvent } from 'twokei-framework';
import { finyAnyUsableChannel } from '../utils/channel-utilities';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import { setupNewChannel } from '../modules/setup-new-channel';
import { i18nGuild } from '../translation/guild-i18n';

export const guildJoin = createEvent('guildCreate', async guild => {
  const { id, name: guildName, memberCount } = guild;

  console.log(`Joined guild ${guildName} (${id}) with ${memberCount} members`);

  const adminUsableChannel = await finyAnyUsableChannel(guild);

  if (!adminUsableChannel) {
    console.log(`No usable admin channel found for guild ${guildName} (${id})`);
    return;
  }

  console.log(`Using channel ${adminUsableChannel.name} (${adminUsableChannel.id}) for guild ${guildName} (${id})`);

  const description = [
    'So you invited me to your server, thats great!',
    'Let me explain how I work:',
    '',
    '<:2K:1068954133320708116> **First, you can create a channel for me.**',
    '1. If you create the channel, you can **still use the command** (or mention).',
    '2. To create the channel, click the `Setup` button below.',
    '',
    ':sob: **If you dont want to use the channel, theres some options:**',
    '- :mouse: The command (click here): </play:1067082391975362654>',
    `- :keyboard: Or mention me with the song: ${guild.members.me!.toString()} [<url/search>](https://youtu.be/dQw4w9WgXcQ)`
  ];

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

  const name = await i18nGuild(id, 'name');

  const embed = new EmbedBuilder()
    .setTitle(`:wave: Hi there! I'm ${name}!`)
    .setDescription(description.join('\n'));

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
    .catch(() => adminUsableChannel.send('Something went wrong, please try again or ask for support: https://discord.gg/twokei'))
    .finally(() => introduction.delete());
});