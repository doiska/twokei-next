import { registerEvent } from "../../handlers/events/EventRegister";
import { InteractionType } from "discord-api-types/v10";
import { handleCommand } from "../../handlers/command/CommandHandler";
import { APIEmbed } from "discord.js";

registerEvent("interactionCreate", async (interaction) => {
  if (interaction.type !== InteractionType.ApplicationCommand) {
    return;
  }

  await interaction.deferReply();

  try {
    const response = await handleCommand(interaction);

    if (response) {
      const isObject = typeof response === "object";
      await interaction.editReply(isObject ? { embeds: [response as APIEmbed] } : response);
    } else {
      await interaction.deleteReply();
    }
  } catch (e) {
    await interaction.editReply(`An error occurred. Please try again later.`);
  }
});