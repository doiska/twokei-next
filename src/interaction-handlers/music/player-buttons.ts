import { type ButtonInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember } from "@sapphire/discord.js-utilities";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
  type Option,
} from "@sapphire/framework";

import { PlayerButtons } from "@/constants/music/player-buttons";
import { destroyPlayerInstance } from "@/music/heizou/destroy-player-instance";
import { pauseSong } from "@/music/heizou/pause-song";
import { previousSong } from "@/music/heizou/previous-song";
import { setLoopState } from "@/music/heizou/set-loop-state";
import { shuffleQueue } from "@/music/heizou/shuffle-queue";
import { skipSong } from "@/music/heizou/skip-song";
import { getReadableException } from "@/structures/exceptions/utils/get-readable-exception";
import { send } from "@/lib/message-handler";
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

    try {
      await interaction.deferReply({
        ephemeral: true,
      });

      await action(interaction.member);

      await interaction.deleteReply();
    } catch (e) {
      await send(interaction, {
        embeds: Embed.error(
          await resolveKey(interaction, getReadableException(e)),
        ),
        ephemeral: true,
      });
    }
  }

  public override parse(interaction: ButtonInteraction): Option<PlayerButtons> {
    const customId = interaction.customId;
    const buttons = Object.keys(PlayerButtons);

    const button = buttons.find((b) => b === customId);

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
