import type { ButtonInteraction } from 'discord.js';
import { type Awaitable } from '@sapphire/utilities';
import { InteractionHandler, InteractionHandlerTypes, type Option } from '@sapphire/framework';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';

import { fetchT } from 'twokei-i18next';
import { getRandomLoadingMessage } from '@/utils/utils';
import { Embed } from '@/utils/messages';
import { createSongProfileEmbed } from '@/features/song-profile/show-song-profile';
import { EmbedButtons } from '@/constants/music/player-buttons';

@ApplyOptions<InteractionHandler.Options>({
  name: 'profile-sync',
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ProfileSync extends InteractionHandler {
  public override parse (buttonInteraction: ButtonInteraction): Awaitable<Option<unknown>> {
    if (buttonInteraction.customId !== EmbedButtons.VIEW_PROFILE) {
      return this.none();
    }

    return this.some();
  }

  public override async run (buttonInteraction: ButtonInteraction) {
    if (!buttonInteraction.member || !isGuildMember(buttonInteraction.member)) {
      return;
    }

    const t = await fetchT(buttonInteraction);

    await buttonInteraction.reply({
      embeds: [Embed.loading(t(getRandomLoadingMessage()) ?? 'Loading...')],
    });

    await buttonInteraction.editReply(
      await createSongProfileEmbed(
        buttonInteraction.user,
        buttonInteraction.user,
      ),
    );
  }
}
