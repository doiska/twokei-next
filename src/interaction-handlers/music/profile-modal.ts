import { type ModalSubmitInteraction } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, type Option } from '@sapphire/framework';
import { type Awaitable } from '@sapphire/utilities';

import { Modals } from '@/constants/music/player-buttons';

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

    console.log(modalInteraction.fields);

    return this.some(modalInteraction.fields);
  }

  public override run (interaction: ModalSubmitInteraction, parsedData?: Record<string, string>) {
    console.log(parsedData);
  }
}
