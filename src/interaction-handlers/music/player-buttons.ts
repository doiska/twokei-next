import { type ButtonInteraction } from 'discord.js';
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes, type Option,
} from '@sapphire/framework';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';

import { resolveKey } from 'twokei-i18next';
import { getRandomLoadingMessage } from '@/utils/utils';
import { Embed } from '@/utils/messages';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { skipSong } from '@/music/heizou/skip-song';
import { shuffleQueue } from '@/music/heizou/shuffle-queue';
import { setLoopState } from '@/music/heizou/set-loop-state';
import { previousSong } from '@/music/heizou/previous-song';
import { pauseSong } from '@/music/heizou/pause-song';
import { destroyPlayerInstance } from '@/music/heizou/destroy-player-instance';
import { PlayerButtons } from '@/constants/music/player-buttons';
import { noop } from '@sapphire/utilities';

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
      return;
    }

    if (player.voiceId !== interaction.member?.voice?.channelId) {
      await interaction.reply({
        ephemeral: true,
        embeds: [
          Embed.error(
            await resolveKey(interaction, ErrorCodes.NOT_SAME_VC),
          ),
        ],
      });

      setTimeout(() => {
        interaction.deleteReply()
          .catch(noop);
      }, 8000);
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
      await action(interaction.member);

      await interaction.reply({
        ephemeral: true,
        embeds: [
          {
            description: (await resolveKey(interaction, getRandomLoadingMessage()) satisfies string) ?? '',
          },
        ],
      });
    } catch (e) {
      const readable = await getReadableException(e, interaction.guild);

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
