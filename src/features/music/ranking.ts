import {
  Message,
  ModalSubmitInteraction,
  type RepliableInteraction,
} from "discord.js";

export function showRanking(
  interaction: Exclude<RepliableInteraction, ModalSubmitInteraction> | Message,
) {}
