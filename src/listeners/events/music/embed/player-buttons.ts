import { Interaction } from 'discord.js';
import { createEvent, MessageBuilder } from 'twokei-framework';

import { xiao } from '../../../../app/Xiao';
import {
  DynamicPrimaryButtons,
  DynamicSecondaryButtons,
} from '../../../../constants/music';
import { logger } from '../../../../modules/logger-transport';
import { FriendlyException } from '../../../../structures/exceptions/FriendlyException';
import { PlayerException } from '../../../../structures/exceptions/PlayerException';
import { getReadableException } from '../../../../structures/exceptions/utils/get-readable-exception';
import { isGuildMember } from '../../../../utils/type-guards';

export const onButtonClickEvent = createEvent(
  'interactionCreate',
  async (interaction: Interaction) => {
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

    const player = xiao.getPlayer(guild.id);

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

    if (!buttonFunction.execute) {
      return;
    }

    return buttonFunction
      .execute(member)
      .then(() => interaction.deleteReply())
      .catch((err: unknown) => {
        if (
          err instanceof PlayerException
          || err instanceof FriendlyException
        ) {
          interaction.editReply(getReadableException(err));
          return;
        }

        logger.error(err);

        interaction.editReply(
          new MessageBuilder().setEmbeds({
            title: 'Error',
            description: 'An error occurred while executing this command.',
          }),
        );
      });
  },
);
