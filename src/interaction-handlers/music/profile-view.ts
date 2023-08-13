import type { ButtonInteraction } from 'discord.js';
import { chatInputApplicationCommandMention } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { container, InteractionHandler, InteractionHandlerTypes, type Option } from '@sapphire/framework';
import { type Awaitable } from '@sapphire/utilities';

import { EmbedButtons } from '@/constants/music/player-buttons';
import { createSongProfileEmbed } from '@/features/song-profile/show-song-profile';
import { Embed } from '@/utils/messages';
import { sendPresetMessage } from '@/utils/utils';

import { resolveKey } from 'twokei-i18next';

@ApplyOptions<InteractionHandler.Options>({
  name: 'profile-sync',
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ProfileView extends InteractionHandler {
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
      ephemeral: true,
    });

    await buttonInteraction.editReply(
      await createSongProfileEmbed(
        buttonInteraction.user,
        buttonInteraction.user,
      ),
    );

    const [commandName, commandId] = [...container.applicationCommandRegistries.acquire('profile').chatInputCommands.values()];

    await buttonInteraction.followUp({
      ephemeral: true,
      embeds: [
        Embed.info(await resolveKey(buttonInteraction, 'profile:suggestion', {
          command_profile: chatInputApplicationCommandMention(commandName, commandId ?? ''),
        })),
      ],
    });
  }
}
