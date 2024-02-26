import { type StringSelectMenuInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  container,
  InteractionHandler,
  InteractionHandlerTypes,
  type Option,
} from "@sapphire/framework";
import { type Awaitable } from "@sapphire/utilities";

import { Menus } from "@/constants/buttons";
import { RateLimitManager } from "@sapphire/ratelimits";
import { logger } from "@/lib/logger";

const rateLimitManager = new RateLimitManager(5000);

@ApplyOptions<InteractionHandler.Options>({
  name: "player-menu",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.SelectMenu,
})
export class PlayerMenu extends InteractionHandler {
  public override parse(
    interaction: StringSelectMenuInteraction,
  ): Awaitable<Option<string | number>> {
    const currentRateLimit = rateLimitManager.acquire(interaction.user.id);

    if (currentRateLimit.limited) {
      return this.none();
    }

    const [value] = interaction.values ?? [];

    if (interaction.customId !== Menus.SelectSongMenu) {
      return this.none();
    }

    if (!value) {
      return this.some("pause");
    }

    if (value === "previous" || value === "current") {
      return this.some(value);
    }

    const songId = Number(value);

    if (Number.isNaN(songId)) {
      return this.none();
    }

    currentRateLimit.consume();
    return this.some(songId);
  }

  public override async run(
    interaction: StringSelectMenuInteraction,
    option: InteractionHandler.ParseResult<this>,
  ) {
    if (!interaction.guild || !interaction.guildId) {
      return;
    }

    const player = this.container.xiao.getPlayer(interaction.guild.id);

    if (!player?.voiceId) {
      return;
    }

    try {
      if (option === "pause") {
        player.pause();
      } else if (option === "previous" && player.queue.previous) {
        await player.play(player.queue.previous, {
          noReplace: false,
        });
      } else if (typeof option === "number") {
        await player.skip(option + 1);
      }
    } catch (error) {
      logger.error(error);
    }

    await interaction.deferUpdate();
  }
}

void container.stores.loadPiece({
  name: "player-menu",
  piece: PlayerMenu,
  store: "interaction-handlers",
});
