import { SelectMenuInteraction } from 'discord.js';
import { Awaitable } from '@sapphire/utilities';
import { InteractionHandler, InteractionHandlerTypes, Option } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

import { resolveKey } from 'twokei-i18next';
import { getRandomLoadingMessage } from '@/utils/utils';
import { Embed } from '@/utils/messages';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { Menus } from '@/constants/music';

@ApplyOptions<InteractionHandler.Options>({
  name: 'player-menu',
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.SelectMenu,
})
export class PlayerMenu extends InteractionHandler {
  public override parse(interaction: SelectMenuInteraction): Awaitable<Option<string | number>> {
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

  public override async run(
    interaction: SelectMenuInteraction,
    option: InteractionHandler.ParseResult<this>,
  ) {
    const player = this.container.xiao.getPlayer(interaction.guildId!);

    if (!player || !player.voiceId) {
      return;
    }

    await interaction.reply({
      ephemeral: true,
      embeds: [Embed.success(await resolveKey(interaction, getRandomLoadingMessage()) as string)],
    });

    try {
      if (option === 'pause') {
        player.pause(true);
      } else if (option === 'previous' && player.queue.previous) {
        await player.play(player.queue.previous, { replace: true });
      } else if (typeof option === 'number') {
        await player.skip(option);
      }
    } catch (error) {
      await interaction.editReply({
        embeds: [Embed.error(await getReadableException(error, interaction.guild))],
      });
    } finally {
      await interaction.deleteReply();
    }
  }
}
