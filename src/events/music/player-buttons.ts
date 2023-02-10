import { Interaction } from 'discord.js';
import { createEvent, MessageBuilder } from 'twokei-framework';
import { isGuildMember } from '../../utils/discord-type-guards';
import { DefaultButtons, PlayerPrimaryButtons, SecondaryButtons } from '../../constants/music';
import { logger } from '../../modules/logger-transport';
import { bold } from 'kleur';
import { getReadableException } from '../../exceptions/utils/get-readable-exception';
import { PlayerException } from '../../exceptions/PlayerException';
import { FriendlyException } from '../../exceptions/FriendlyException';

export const onButtonClickEvent = createEvent('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const { member, customId, guild } = interaction;

  if (!customId || !guild || !isGuildMember(member)) {
    return;
  }

  const buttonFunction = PlayerPrimaryButtons[customId] || SecondaryButtons[customId] || DefaultButtons[customId];

  if (!buttonFunction) {
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  logger.debug(`Button ${bold(customId)} was clicked by ${member.user.tag} in ${guild.name}`);

  return buttonFunction.execute(member)
    .then(() => interaction.deleteReply())
    .catch((err) => {
      if (err instanceof PlayerException || err instanceof FriendlyException) {
        interaction.editReply(getReadableException(err));
        return;
      }

      logger.error(err);
      interaction.editReply(new MessageBuilder().setEmbeds({
        title: 'Error', description: 'An error occurred while' +
          ' executing this command'
      }));
    });
})