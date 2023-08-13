import { type ModalSubmitInteraction } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, type Option } from '@sapphire/framework';
import { type Awaitable } from '@sapphire/utilities';

import { and, eq } from 'drizzle-orm';
import { kil } from '@/db/Kil';
import { songProfileSources } from '@/db/schemas/song-profile-sources';

import { Modals } from '@/constants/music/player-buttons';
import { playerLogger } from '@/modules/logger-transport';

@ApplyOptions<InteractionHandler.Options>({
  name: 'profile-modal',
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class ProfileModal extends InteractionHandler {
  public override parse (
    modalInteraction: ModalSubmitInteraction,
  ): Awaitable<Option<unknown>> {
    if (modalInteraction.customId !== Modals.ProfileModal) {
      return this.none();
    }

    return this.some(modalInteraction.fields);
  }

  public override async run (interaction: ModalSubmitInteraction) {
    const field = interaction.fields.getTextInputValue('spotify');

    await interaction.deferReply({ ephemeral: true });

    const spotifyRegex = /^https:\/\/open\.spotify\.com\/user\/([^?]+)/;
    const [, userId] = spotifyRegex.exec(field) ?? [];

    await kil.insert(songProfileSources).values({
      userId: interaction.user.id,
      source: 'Spotify',
      sourceUrl: userId,
    })
      .onConflictDoUpdate({
        set: {
          sourceUrl: userId,
        },
        where: and(
          eq(songProfileSources.userId, interaction.user.id),
          eq(songProfileSources.source, 'Spotify'),
        ),
        target: [songProfileSources.userId, songProfileSources.source],
      });

    playerLogger.info(`[Sync] ${interaction.user.tag} set their Spotify profile to ${field}`);

    await interaction.editReply({
      content: 'Synced!',
    });
  }
}
