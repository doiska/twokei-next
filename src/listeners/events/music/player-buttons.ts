import { Interaction } from 'discord.js';
import { createEvent, MessageBuilder } from 'twokei-framework';
import { DynamicPrimaryButtons, DynamicSecondaryButtons } from '../../../constants/music';
import { logger } from '../../../modules/logger-transport';
import { bold } from 'kleur';
import { getReadableException } from '../../../structures/exceptions/utils/get-readable-exception';
import { PlayerException } from '../../../structures/exceptions/PlayerException';
import { FriendlyException } from '../../../structures/exceptions/FriendlyException';
import { isGuildMember } from '../../../utils/type-guards';
import { Twokei } from '../../../app/Twokei';

export const onButtonClickEvent = createEvent('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  const { member, customId, guild } = interaction;

  if (!customId || !member || !guild) {
    return;
  }

  if (!isGuildMember(member)) {
    return;
  }

  const player = Twokei.xiao.getPlayer(guild.id);

  if (!player) {
    return;
  }

  const primary = DynamicPrimaryButtons();
  const secondary = DynamicSecondaryButtons();

  const buttonFunction = primary[customId] || secondary[customId];

  if (!buttonFunction) {
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  return buttonFunction.execute(member)
      .then(() => interaction.deleteReply())
      .catch((err: unknown) => {
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