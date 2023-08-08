import { type StringSelectMenuInteraction } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, type Option } from '@sapphire/framework';
import { type Awaitable } from '@sapphire/utilities';

import { Menus } from '@/constants/music/player-buttons';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { sendPresetMessage } from '@/utils/utils';

@ApplyOptions<InteractionHandler.Options>({
  name: 'player-menu',
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.SelectMenu,
})
export class PlayerMenu extends InteractionHandler {
  public override parse (interaction: StringSelectMenuInteraction): Awaitable<Option<string | number>> {
    const [value] = interaction.values ?? [];

    if (interaction.customId !== Menus.SelectSongMenu) {
      return this.none();
    }

    if (!value) {
      return this.some('pause');
    }

    if (value === 'previous' || value === 'current') {
      return this.some(value);
    }

    const songId = Number(value);

    if (Number.isNaN(songId)) {
      return this.none();
    }

    return this.some(songId);
  }

  public override async run (
    interaction: StringSelectMenuInteraction,
    option: InteractionHandler.ParseResult<this>,
  ) {
    if (!interaction.guildId) {
      return;
    }

    const player = this.container.xiao.getPlayer(interaction.guildId);

    if (!player?.voiceId) {
      return;
    }

    await sendPresetMessage({
      interaction,
      preset: 'loading',
      ephemeral: true,
    });

    try {
      if (option === 'pause') {
        player.pause(true);
      } else if (option === 'previous' && player.queue.previous) {
        await player.play(player.queue.previous, { replace: true });
      } else if (typeof option === 'number') {
        await player.skip(option + 1);
      }
      await interaction.deleteReply();
    } catch (error) {
      await sendPresetMessage({
        interaction,
        message: getReadableException(error),
        preset: 'error',
      });
    }
  }
}
