import type { ButtonInteraction } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { InteractionHandler, InteractionHandlerTypes, type Option } from '@sapphire/framework';
import { type Awaitable } from '@sapphire/utilities';

import { EmbedButtons } from '@/constants/music/player-buttons';
import { createSongProfileEmbed } from '@/features/song-profile/show-song-profile';
import { sendPresetMessage } from '@/utils/utils';

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

    await sendPresetMessage({
      interaction: buttonInteraction,
      preset: 'loading',
    });

    await buttonInteraction.editReply(
      await createSongProfileEmbed(
        buttonInteraction.user,
        buttonInteraction.user,
      ),
    );
  }
}
