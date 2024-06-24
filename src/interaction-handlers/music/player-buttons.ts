import { type ButtonInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
  type Option,
} from "@sapphire/framework";

import { PlayerButtons } from "@/constants/buttons";
import { destroyPlayerInstance } from "@/music/functions/destroy-player-instance";
import { pauseSong } from "@/music/functions/pause-song";
import { previousSong } from "@/music/functions/previous-song";
import { setLoopState } from "@/music/functions/set-loop-state";
import { shuffleQueue } from "@/music/functions/shuffle-queue";
import { skipSong } from "@/music/functions/skip-song";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { Embed } from "@/utils/messages";
import { resolveKey } from "@/i18n";

@ApplyOptions<InteractionHandler.Options>({
  name: "buttons-player",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class PlayerButtonsInteraction extends InteractionHandler {
  public async run(interaction: ButtonInteraction, button: PlayerButtons) {
    if (!interaction.guild || !isGuildMember(interaction.member)) {
      return;
    }

    const player = container.xiao.getPlayer(interaction.guild.id);

    if (!player) {
      await container.sc.reset(interaction.guild);
      return;
    }

    if (player.voiceId !== interaction.member?.voice?.channelId) {
      return;
    }

    const actions = {
      [PlayerButtons.STOP]: destroyPlayerInstance,
      [PlayerButtons.PREVIOUS]: previousSong,
      [PlayerButtons.PAUSE]: pauseSong,
      [PlayerButtons.RESUME]: pauseSong,
      [PlayerButtons.SKIP]: skipSong,
      [PlayerButtons.SHUFFLE]: shuffleQueue,
      [PlayerButtons.LOOP]: setLoopState,
    } as const;

    const action = actions?.[button as keyof typeof actions];

    if (!action) {
      return;
    }

    await interaction.deferReply({
      ephemeral: true,
    });

    try {
      await action(interaction.member);
      await interaction.deleteReply();
    } catch (e) {
      await interaction.editReply({
        embeds: Embed.error(
          await resolveKey(interaction, getReadableException(e)),
        ),
      });
    }
  }

  public override parse(interaction: ButtonInteraction): Option<PlayerButtons> {
    const customId = interaction.customId;
    const buttons = Object.keys(PlayerButtons);

    const button = buttons.find((buttonId) => buttonId === customId);

    if (button) {
      return this.some(button as PlayerButtons);
    }

    return this.none();
  }
}

void container.stores.loadPiece({
  name: "player-buttons",
  piece: PlayerButtonsInteraction,
  store: "interaction-handlers",
});
