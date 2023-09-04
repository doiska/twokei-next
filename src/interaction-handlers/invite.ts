import type { ButtonInteraction } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
  type None,
  type Option,
} from "@sapphire/framework";

import { EmbedButtons } from "@/constants/music/player-buttons";
import { sendPresetMessage } from "@/lib/message-handler/helper";

@ApplyOptions<InteractionHandler.Options>({
  name: "invite-button",
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class Invite extends InteractionHandler {
  parse(buttonInteraction: ButtonInteraction): Option<None> {
    if (buttonInteraction.customId !== EmbedButtons.INVITE) {
      return this.none();
    }

    return this.some();
  }

  async run(interaction: ButtonInteraction) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    const buttons = row.addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("twokei.com")
        .setURL(
          "https://twokei.com/?utm_campaign=invite_button&utm_medium=discord&utm_source=bot",
        ),
    );

    await sendPresetMessage({
      interaction,
      preset: "success",
      message: "common:invite_embed",
      components: [buttons],
    });
  }
}
