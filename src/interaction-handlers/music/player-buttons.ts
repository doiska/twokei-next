import { type ButtonInteraction } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes, type Option,
} from '@sapphire/framework';

import { PlayerButtons } from '@/constants/music/player-buttons';
import { destroyPlayerInstance } from '@/music/heizou/destroy-player-instance';
import { pauseSong } from '@/music/heizou/pause-song';
import { previousSong } from '@/music/heizou/previous-song';
import { setLoopState } from '@/music/heizou/set-loop-state';
import { shuffleQueue } from '@/music/heizou/shuffle-queue';
import { skipSong } from '@/music/heizou/skip-song';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { Embed } from '@/utils/messages';
import { sendPresetMessage } from '@/utils/utils';

@ApplyOptions<InteractionHandler.Options>({
  name: 'buttons-player',
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class PlayerButtonsInteraction extends InteractionHandler {
  public async run (
    interaction: ButtonInteraction,
    button: PlayerButtons,
  ) {
    if (!interaction.guild || !isGuildMember(interaction.member)) {
      return;
    }

    const player = container.xiao.getPlayer(interaction.guild);

    if (!player) {
      await container.sc.reset(interaction.guild);
      return;
    }

    if (player.voiceId !== interaction.member?.voice?.channelId) {
      await sendPresetMessage({
        interaction,
        message: ErrorCodes.NOT_SAME_VC,
        ephemeral: true,
        preset: 'error',
        deleteIn: 8,
      });
      return;
    }

    const actions = {
      [PlayerButtons.STOP]: destroyPlayerInstance,
      [PlayerButtons.PREVIOUS]: previousSong,
      [PlayerButtons.PAUSE]: pauseSong,
      [PlayerButtons.SKIP]: skipSong,
      [PlayerButtons.SHUFFLE]: shuffleQueue,
      [PlayerButtons.LOOP]: setLoopState,
    } as const;

    const action = actions?.[button as keyof typeof actions];

    if (!action) {
      return;
    }

    try {
      await sendPresetMessage({
        preset: 'loading',
        interaction,
      });

      await action(interaction.member);
    } catch (e) {
      const readable = getReadableException(e);

      await interaction.reply({
        ephemeral: true,
        embeds: [
          Embed.error(readable),
        ],
      });
    } finally {
      setTimeout(() => {
        interaction.deleteReply()
          .catch(() => {});
      }, 8000);
    }
  }

  public override parse (interaction: ButtonInteraction): Option<PlayerButtons> {
    const customId = interaction.customId;
    const buttons = Object.keys(PlayerButtons);

    const button = buttons.find((b) => b === customId);

    if (button) {
      return this.some(button as PlayerButtons);
    }

    return this.none();
  }
}
