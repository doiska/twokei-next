import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";

import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction } from "discord.js";
import { undefined } from "zod";

@ApplyOptions<InteractionHandler.Options>({
  name: "profile-view",
  enabled: true,
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ProfileViewInteraction extends InteractionHandler {
  run(): unknown {
    return undefined;
  }
}
