import type {
  InteractionButtonComponentData,
  LinkButtonComponentData,
} from "discord.js";
import { isObject } from "@sapphire/utilities";
import { ButtonStyle } from "discord.js";

export function isButtonLink(
  button: unknown,
): button is LinkButtonComponentData {
  if (!isObject(button)) {
    return false;
  }

  return (
    "url" in button && "style" in button && button.style === ButtonStyle.Link
  );
}

export function isButton(
  button: unknown,
): button is InteractionButtonComponentData {
  if (!isObject(button)) {
    return false;
  }

  return "customId" in button;
}
