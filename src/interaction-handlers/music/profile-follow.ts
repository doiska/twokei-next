import { ApplyOptions } from '@sapphire/decorators';
import type { Option } from '@sapphire/framework';
import { InteractionHandlerTypes, InteractionHandler, container } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import type { Awaitable } from '@sapphire/utilities';
import { SongProfileButtons } from '@/constants/music/player-buttons';
import { Embed } from '@/utils/messages';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { getRandomLoadingMessage } from '@/utils/utils';
import { fetchT } from 'twokei-i18next';

@ApplyOptions<InteractionHandler.Options>({
  name: 'song-profile-interactions',
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class SongProfileInteractionsHandler extends InteractionHandler {
  public async run (
    interaction: ButtonInteraction,
    target: string,
  ) {
    if (!target) {
      return;
    }

    const t = await fetchT(interaction);

    await interaction.reply({
      embeds: [Embed.loading(t(getRandomLoadingMessage()) ?? 'Loading...')],
      ephemeral: true,
    });

    try {
      await container.profiles.actions.toggleLike(interaction.user.id, target);
      await interaction.editReply({
        embeds: [Embed.success('All good!')],
      });
    } catch (e) {
      await interaction.editReply({
        embeds: [Embed.error(await getReadableException(e))],
      });
    }
  }

  public parse (buttonInteraction: ButtonInteraction): Awaitable<Option<string>> {
    if (!buttonInteraction.customId.startsWith(SongProfileButtons.LIKE_PROFILE) &&
        !buttonInteraction.customId.startsWith(SongProfileButtons.FOLLOW_PROFILE)
    ) {
      return this.none();
    }

    const targetId = buttonInteraction.customId.split('-')[1];

    return this.some(targetId);
  }
}
